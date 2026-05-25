from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import secrets
import string
import math
import hashlib
import httpx
import os
from typing import Dict, Any

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

ROCKYOU_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "rockyou.txt")

class PasswordCheckRequest(BaseModel):
    password: str

class PasswordGenerateRequest(BaseModel):
    length: int = 16
    use_uppercase: bool = True
    use_numbers: bool = True
    use_symbols: bool = True

@router.post("/password/check")
async def check_password(request: PasswordCheckRequest, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    pwd = request.password
    
    # 1. Calculate Score / Strength
    score = 0
    feedback = []
    
    length = len(pwd)
    if length < 8:
        feedback.append("Terlalu pendek (minimal 8 karakter).")
    elif length >= 12:
        score += 2
    else:
        score += 1
        
    has_upper = any(c.isupper() for c in pwd)
    has_lower = any(c.islower() for c in pwd)
    has_digit = any(c.isdigit() for c in pwd)
    has_symbol = any(c in string.punctuation for c in pwd)
    
    if has_upper: score += 1
    if has_lower: score += 1
    if has_digit: score += 1
    if has_symbol: score += 1
    
    # Entropy calculation
    charset_size = 0
    if has_lower: charset_size += 26
    if has_upper: charset_size += 26
    if has_digit: charset_size += 10
    if has_symbol: charset_size += len(string.punctuation)
    
    entropy = 0
    if charset_size > 0 and length > 0:
        entropy = length * math.log2(charset_size)
        
    # 2. Local Rockyou Check
    is_in_rockyou = False
    if os.path.exists(ROCKYOU_PATH):
        # Because it's 478KB, we can read it to memory safely or check line by line
        try:
            with open(ROCKYOU_PATH, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if line.strip() == pwd:
                        is_in_rockyou = True
                        break
        except Exception as e:
            print(f"Error reading rockyou: {e}")
            
    # 3. Global HIBP Check (k-Anonymity)
    pwned_count = 0
    sha1_hash = hashlib.sha1(pwd.encode('utf-8')).hexdigest().upper()
    prefix = sha1_hash[:5]
    suffix = sha1_hash[5:]
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://api.pwnedpasswords.com/range/{prefix}")
            if resp.status_code == 200:
                hashes = resp.text.splitlines()
                for h in hashes:
                    h_suffix, count = h.split(':')
                    if h_suffix == suffix:
                        pwned_count = int(count)
                        break
    except Exception as e:
        print(f"HIBP API error: {e}")

    # Determine risk level
    if is_in_rockyou or pwned_count > 0:
        risk_level = "CRITICAL"
        score = 0
    elif entropy < 40:
        risk_level = "HIGH"
    elif entropy < 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    return {
        "score": score,  # 0 to 6
        "entropy": round(entropy, 2),
        "risk_level": risk_level,
        "feedback": feedback,
        "is_in_rockyou": is_in_rockyou,
        "pwned_count": pwned_count
    }

@router.post("/password/generate")
async def generate_password(request: PasswordGenerateRequest, current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    length = max(8, min(request.length, 128))
    
    chars = string.ascii_lowercase
    if request.use_uppercase:
        chars += string.ascii_uppercase
    if request.use_numbers:
        chars += string.digits
    if request.use_symbols:
        # Use safe symbols
        chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
    if not chars:
        chars = string.ascii_lowercase
        
    # Ensure at least one of each requested type
    pwd = []
    if request.use_uppercase:
        pwd.append(secrets.choice(string.ascii_uppercase))
    if request.use_numbers:
        pwd.append(secrets.choice(string.digits))
    if request.use_symbols:
        pwd.append(secrets.choice("!@#$%^&*()_+-=[]{}|;:,.<>?"))
        
    pwd.append(secrets.choice(string.ascii_lowercase))
    
    # Fill the rest
    while len(pwd) < length:
        pwd.append(secrets.choice(chars))
        
    # Shuffle
    secrets.SystemRandom().shuffle(pwd)
    result = "".join(pwd)
    
    return {"password": result}

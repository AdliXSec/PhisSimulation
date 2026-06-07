import json
import httpx
import hashlib
from app.core.config import settings
from app.core.redis import redis_client


async def _get_cache(key: str) -> dict | None:
    """Retrieve data from Redis cache."""
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def _set_cache(key: str, data: dict, expire: int = 86400):
    """Save data to Redis cache (default 24h)."""
    try:
        await redis_client.set(key, json.dumps(data), ex=expire)
    except Exception:
        pass


async def _call_openrouter(system_prompt: str, user_prompt: str) -> str:
    """Make a request to OpenRouter API with DeepSeek V3.2."""
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            settings.OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "reasoning": {"enabled": True},
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def generate_phishing_template(
    theme: str,
    difficulty: str,
    target_departments: list[int],
    external_url: str | None = None,
    ai_instructions: str | None = None,
    lang: str = "id",
) -> dict:
    """Use AI to generate a spear-phishing email template."""
    # Try cache first
    cache_key = f"ai:email:{hashlib.md5(f'{theme}:{difficulty}:{target_departments}:{external_url}:{ai_instructions}:{lang}'.encode()).hexdigest()}"
    cached = await _get_cache(cache_key)
    if cached:
        return cached

    difficulty_map = {
        "LOW": "Rendah — email mudah dikenali sebagai phishing, banyak red flag yang terlihat",
        "MEDIUM": "Menengah — email cukup meyakinkan, ada beberapa red flag halus",
        "HIGH": "Tinggi — email sangat meyakinkan, manipulasi psikologis tinggi, hampir tidak ada red flag",
    }

    system_prompt = (
        "Anda adalah SecOps Expert AI yang membantu membuat simulasi phishing untuk security awareness training. "
        "Anda HARUS menghasilkan output dalam format JSON yang valid. "
        "Jangan tambahkan teks atau penjelasan di luar JSON. "
        "Jangan gunakan markdown code block. Langsung berikan JSON."
    )

    external_instruction = (
        f"\n- Arahkan target seolah-olah mereka akan mengunjungi {external_url} (jadikan ini konteks cerita)."
        if external_url else ""
    )

    admin_instruction = (
        f"\nInstruksi Tambahan dari Admin (WAJIB dipatuhi, gunakan detail berikut dalam email):\n{ai_instructions}"
        if ai_instructions else ""
    )

    lang_instruction = "bahasa Inggris" if lang.startswith("en") else "bahasa Indonesia"
    user_prompt = f"""Buat satu template email spear-phishing dalam {lang_instruction} untuk simulasi keamanan internal perusahaan.

Parameter:
- Tema: {theme}
- Tingkat kesulitan: {difficulty_map.get(difficulty, difficulty)}
- Target: karyawan perusahaan

Instruksi:
- Email harus terlihat REALISTIS sesuai tema dan tingkat kesulitan
- Gunakan manipulasi psikologis yang sesuai tingkat kesulitan (urgensi, otoritas, kelangkaan)
- Sertakan call-to-action yang mengarahkan target untuk klik link{external_instruction}
- Gunakan placeholder {{{{tracking_link}}}} untuk atribut href pada link (jangan taruh link asli di href).
- JANGAN gunakan placeholder lain seperti {{{{Nama Perusahaan}}}} atau {{{{nama_karyawan}}}}. Langsung karang nama perusahaan fiktif yang realistis, atau gunakan nama perusahaan jika ada di instruksi.
- Jangan gunakan kata-kata kasar atau mengancam secara berlebihan{admin_instruction}

Output format JSON:
{{
    "subject": "Subject email",
    "body_html": "<html>Isi email dalam HTML</html>",
    "sender_name": "Nama pengirim yang meyakinkan",
    "sender_email": "email-pengirim@domain-meyakinkan.com",
    "department_target": "Nama departemen target",
    "red_flags": ["List red flag yang bisa dikenali karyawan waspada"],
    "manipulation_technique": "Teknik manipulasi yang digunakan"
}}"""

    if lang.startswith("en"):
        user_prompt += "\n\n[CRITICAL INSTRUCTION: You MUST generate all the content (email body, subject, sender name, etc) entirely in ENGLISH.]"

    raw_response = await _call_openrouter(system_prompt, user_prompt)

    # Try to parse JSON from response
    try:
        # Clean up potential markdown code blocks
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: try to extract JSON from text
        start = raw_response.find("{")
        end = raw_response.rfind("}") + 1
        if start != -1 and end > start:
            result = json.loads(raw_response[start:end])
        else:
            raise ValueError(f"AI response is not valid JSON: {raw_response[:200]}")

    result_data = {
        "subject": result.get("subject", ""),
        "body_html": result.get("body_html", ""),
        "sender_name": result.get("sender_name", ""),
        "sender_email": result.get("sender_email", ""),
        "department_target": result.get("department_target", ""),
        "metadata": {
            "red_flags": result.get("red_flags", []),
            "manipulation_technique": result.get("manipulation_technique", ""),
            "model": settings.OPENROUTER_MODEL,
        },
    }

    # Save to cache
    await _set_cache(cache_key, result_data)
    return result_data


async def generate_campaign_analysis(stats_summary: str, lang: str = "id") -> str:
    """Use AI to generate a narrative analysis of campaign results."""
    system_prompt = (
        "Anda adalah SecOps Expert AI. Berikan jawaban yang teknis, mendalam, dan terstruktur. "
        "Gunakan format Markdown untuk jawaban Anda."
    )

    user_prompt = f"""Analisis statistik simulasi phishing berikut dan berikan:

1. **Ringkasan Eksekutif**: Gambaran umum hasil kampanye
2. **Analisis Risiko**: Identifikasi area kerentanan utama
3. **Perbandingan Benchmark**: Bandingkan dengan rata-rata industri (click rate ~15-20%)
4. **Rekomendasi Pelatihan**: Modul security awareness training yang spesifik dan actionable
5. **Langkah Mitigasi**: Tindakan teknis yang harus segera dilakukan

Data Statistik:
{stats_summary}

Berikan analisis dalam bahasa Indonesia yang profesional dan mudah dipahami oleh manajemen non-teknis."""

    if lang.startswith("en"):
        user_prompt += "\n\n[CRITICAL INSTRUCTION: You MUST write the entire analysis report in ENGLISH.]"

    return await _call_openrouter(system_prompt, user_prompt)


async def generate_landing_page_config(
    theme: str,
    difficulty: str,
    brand_context: str | None = None,
    lang: str = "id",
) -> dict:
    """Use AI to generate a dynamic landing page configuration."""
    # Try cache first
    cache_key = f"ai:landing:{hashlib.md5(f'{theme}:{difficulty}:{brand_context}:{lang}'.encode()).hexdigest()}"
    cached = await _get_cache(cache_key)
    if cached:
        return cached

    system_prompt = (
        "Anda adalah SecOps UI Expert AI yang merancang halaman landing page tiruan untuk simulasi phishing. "
        "Anda HARUS menghasilkan output dalam format JSON yang valid. "
        "Jangan tambahkan teks atau penjelasan di luar JSON. "
        "Jangan gunakan markdown code block. Langsung berikan JSON."
    )

    difficulty_desc = {
        "LOW": "Halaman terlihat generik, ada tanda-tanda mencurigakan yang jelas",
        "MEDIUM": "Halaman cukup meyakinkan, menyerupai portal resmi",
        "HIGH": "Halaman sangat meyakinkan, hampir identik dengan portal asli, sangat profesional",
    }

    user_prompt = f"""Buat konfigurasi visual untuk halaman login tiruan (decoy landing page) simulasi phishing.

Parameter:
- Tema kampanye: {theme}
- Tingkat kemiripan: {difficulty_desc.get(difficulty, difficulty)}
{f'- Konteks brand: {brand_context}' if brand_context else ''}

Instruksi:
- Pilih warna, emoji logo, dan teks yang SESUAI dengan tema
- Jika temanya terkait Microsoft/Office, gunakan gaya Microsoft
- Jika temanya terkait Google, gunakan gaya Google
- Jika temanya internal perusahaan, gunakan gaya corporate
- Jika temanya banking/keuangan, gunakan gaya banking
- Form fields harus realistis sesuai konteks (email, password, PIN, OTP, dll)
- Tingkat profesionalisme teks sesuai difficulty level

Output format JSON:
{{
    "title": "Judul halaman login",
    "subtitle": "Subjudul/pesan yang meyakinkan target",
    "logo_emoji": "Emoji yang mewakili brand (1 emoji saja)",
    "brand_name": "Nama brand yang ditiru",
    "primary_color": "#hex warna utama brand",
    "bg_color": "#hex warna background halaman",
    "text_color": "#hex warna teks utama",
    "button_text": "Teks tombol submit",
    "button_color": "#hex warna tombol",
    "form_fields": [
        {{"name": "field_name", "label": "Label field", "type": "text|email|password|tel", "placeholder": "Placeholder text"}}
    ],
    "footer_text": "Teks footer yang meyakinkan",
    "theme_style": "microsoft365|google|corporate|corporate_dark|banking|generic"
}}"""

    if lang.startswith("en"):
        user_prompt += "\n\n[CRITICAL INSTRUCTION: You MUST generate all the text content (title, subtitle, button text, labels, etc) entirely in ENGLISH.]"

    raw_response = await _call_openrouter(system_prompt, user_prompt)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)
    except json.JSONDecodeError:
        start = raw_response.find("{")
        end = raw_response.rfind("}") + 1
        if start != -1 and end > start:
            result = json.loads(raw_response[start:end])
        else:
            # Fallback to default config
            return _get_default_landing_config(theme)

    # Ensure all required keys exist with defaults
    result_data = {
        "title": result.get("title", "Account Verification"),
        "subtitle": result.get("subtitle", "Please sign in to continue"),
        "logo_emoji": result.get("logo_emoji", "🔒"),
        "brand_name": result.get("brand_name", "Secure Portal"),
        "primary_color": result.get("primary_color", "#0066cc"),
        "bg_color": result.get("bg_color", "#f5f5f5"),
        "text_color": result.get("text_color", "#1a1a1a"),
        "button_text": result.get("button_text", "Sign In"),
        "button_color": result.get("button_color", "#0066cc"),
        "form_fields": result.get("form_fields", [
            {"name": "email", "label": "Email", "type": "email", "placeholder": "user@company.com"},
            {"name": "password", "label": "Password", "type": "password", "placeholder": "Enter password"},
        ]),
        "footer_text": result.get("footer_text", ""),
        "theme_style": result.get("theme_style", "generic"),
    }

    # Save to cache
    await _set_cache(cache_key, result_data)
    return result_data


def _get_default_landing_config(theme: str) -> dict:
    """Fallback landing page config when AI fails."""
    theme_lower = theme.lower() if theme else ""

    if any(w in theme_lower for w in ["microsoft", "office", "365", "outlook"]):
        return {
            "title": "Sign in",
            "subtitle": "Use your work or school account",
            "logo_emoji": "🔷",
            "brand_name": "Microsoft",
            "primary_color": "#0078d4",
            "bg_color": "#f2f2f2",
            "text_color": "#1b1b1b",
            "button_text": "Sign in",
            "button_color": "#0078d4",
            "form_fields": [
                {"name": "email", "label": "Email, phone, or Skype", "type": "email", "placeholder": "user@company.com"},
                {"name": "password", "label": "Password", "type": "password", "placeholder": "Enter your password"},
            ],
            "footer_text": "Terms of use | Privacy & cookies",
            "theme_style": "microsoft365",
        }
    elif any(w in theme_lower for w in ["google", "gmail", "workspace"]):
        return {
            "title": "Sign in",
            "subtitle": "Use your Google Account",
            "logo_emoji": "🔍",
            "brand_name": "Google",
            "primary_color": "#1a73e8",
            "bg_color": "#ffffff",
            "text_color": "#202124",
            "button_text": "Next",
            "button_color": "#1a73e8",
            "form_fields": [
                {"name": "email", "label": "Email or phone", "type": "email", "placeholder": "your-email@company.com"},
                {"name": "password", "label": "Enter your password", "type": "password", "placeholder": "Password"},
            ],
            "footer_text": "One account. All of Google working for you.",
            "theme_style": "google",
        }
    else:
        return {
            "title": "Verifikasi Keamanan Akun",
            "subtitle": "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.",
            "logo_emoji": "🔒",
            "brand_name": "Secure Portal",
            "primary_color": "#0066cc",
            "bg_color": "#f5f5f5",
            "text_color": "#1a1a1a",
            "button_text": "Masuk",
            "button_color": "#0066cc",
            "form_fields": [
                {"name": "email", "label": "Email atau Username", "type": "text", "placeholder": "nama@perusahaan.com"},
                {"name": "password", "label": "Password", "type": "password", "placeholder": "Masukkan password Anda"},
            ],
            "footer_text": "Dengan masuk, Anda menyetujui kebijakan keamanan perusahaan.",
            "theme_style": "corporate",
        }

async def analyze_osint_profile(target_name: str, target_role: str, public_data: str, lang: str = "id") -> dict:
    """Use AI to analyze OSINT data and generate a spear phishing vector."""
    # Try cache first
    cache_key = f"ai:osint:{hashlib.md5(f'{target_name}:{target_role}:{public_data}:{lang}'.encode()).hexdigest()}"
    cached = await _get_cache(cache_key)
    if cached:
        return cached

    system_prompt = (
        "Anda adalah seorang White-Hat Social Engineering Expert. "
        "Anda HARUS menghasilkan output dalam format JSON yang valid. "
        "Jangan tambahkan teks atau penjelasan di luar JSON. "
        "Jangan gunakan markdown code block. Langsung berikan JSON."
    )

    user_prompt = f"""Lakukan analisis 'OSINT & Spear Phishing Profiling' terhadap profil berikut untuk tujuan edukasi Security Awareness:

- Nama Target: {target_name}
- Jabatan: {target_role}
- Data Jejak Digital (OSINT/Publik): {public_data}

Instruksi:
1. Evaluasi tingkat risiko (LOW, MEDIUM, HIGH, CRITICAL) berdasarkan sensitivitas data yang dibagikan.
2. Jelaskan mengapa data tersebut rentan dieksploitasi oleh peretas (vulnerability_summary).
3. Buat 3 skenario/vektor serangan Spear Phishing yang sangat terpersonalisasi berdasarkan data tersebut (kembalikan sebagai list of strings di key attack_vectors).
4. Buat 1 contoh draf email phishing yang mematikan dan meyakinkan berdasarkan vektor terbaik (object dengan key subject, sender, body).

Output format JSON:
{{
    "risk_level": "CRITICAL",
    "vulnerability_summary": "Penjelasan detail mengapa data ini berbahaya...",
    "attack_vectors": [
        "Vektor 1: Penjelasan strategi...",
        "Vektor 2: Penjelasan strategi...",
        "Vektor 3: Penjelasan strategi..."
    ],
    "example_phishing_email": {{
        "subject": "Subjek yang memancing klik",
        "sender": "nama@domain-palsu.com",
        "body": "Isi draf email yang sangat persuasif dan personal..."
    }}
}}"""

    if lang.startswith("en"):
        user_prompt += "\n\n[CRITICAL INSTRUCTION: You MUST generate all the content (vulnerability summary, attack vectors, example email) entirely in ENGLISH.]"

    raw_response = await _call_openrouter(system_prompt, user_prompt)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)
    except json.JSONDecodeError:
        start = raw_response.find("{")
        end = raw_response.rfind("}") + 1
        if start != -1 and end > start:
            result = json.loads(raw_response[start:end])
        else:
            raise ValueError(f"AI response is not valid JSON: {raw_response[:200]}")

    # Save to cache
    await _set_cache(cache_key, result)
    return result

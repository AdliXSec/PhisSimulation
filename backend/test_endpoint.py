import asyncio
import os
import sys

# Add backend dir to path
sys.path.append(os.path.abspath('r:/project/phisimulation/backend'))

from app.core.database import async_session
from app.models.landing_page_template import LandingPageTemplate
from app.api.v1.landing_pages import get_landing_page_template
from app.models.user import User
from sqlalchemy import select

async def test_endpoint():
    async with async_session() as db:
        # Get one template ID
        result = await db.execute(select(LandingPageTemplate).limit(1))
        template = result.scalar_one_or_none()
        
        if not template:
            print("No templates found.")
            return

        template_id_str = str(template.id)
        
        # Mock User
        mock_user = User(id="dummy-user", username="admin")

        print(f"Testing endpoint with ID: {template_id_str}")

        try:
            res = await get_landing_page_template(template_id=template_id_str, db=db, current_user=mock_user)
            print("SUCCESS! Response type:", type(res))
            if "raw_html" in res["config"]:
                print("raw_html IS PRESENT in config!")
            else:
                print("raw_html is MISSING in config!")
        except Exception as e:
            print(f"EXCEPTION: {e}")

asyncio.run(test_endpoint())

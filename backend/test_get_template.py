import asyncio
import os
import sys

# Add backend dir to path
sys.path.append(os.path.abspath('r:/project/phisimulation/backend'))

from app.core.database import async_session
from app.models.landing_page_template import LandingPageTemplate
from sqlalchemy import select

async def test_get():
    async with async_session() as db:
        # Get one template ID
        result = await db.execute(select(LandingPageTemplate).limit(1))
        template = result.scalar_one_or_none()
        
        if not template:
            print("No templates found.")
            return

        template_id_str = str(template.id)
        print(f"Testing with ID: {template_id_str}")

        # Now test the query used in get_landing_page_template
        try:
            result = await db.execute(
                select(LandingPageTemplate).where(LandingPageTemplate.id == template_id_str)
            )
            template_fetched = result.scalar_one_or_none()
            if template_fetched:
                print("SUCCESS: Template fetched by string ID.")
            else:
                print("ERROR: Template not found by string ID!")
        except Exception as e:
            print(f"EXCEPTION: {e}")

asyncio.run(test_get())

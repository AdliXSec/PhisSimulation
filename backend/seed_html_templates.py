import os
import glob
import asyncio
from sqlalchemy import select, text
import sys

# Add backend dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app', '..')))

from app.core.database import async_session
from app.models.landing_page_template import LandingPageTemplate
from app.models.user import User

async def seed_templates():
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates'))
    template_files = glob.glob(os.path.join(template_dir, '*.html'))
    template_files = [f for f in template_files if not f.endswith('.bak') and not f.endswith('test.html')]
    
    async with async_session() as session:
        # Get admin user ID
        result = await session.execute(select(User).where(User.username == 'admin'))
        admin = result.scalar_one_or_none()
        admin_id = admin.id if admin else None

        # Delete old dummy templates
        await session.execute(text("DELETE FROM landing_page_templates WHERE name IN ('Microsoft 365 Login', 'Google Workspace Login', 'Portal Internal Perusahaan', 'Banking Portal')"))

        for filepath in template_files:
            filename = os.path.basename(filepath)
            name = filename.split('.')[0]
            
            # Capitalize name
            if name.lower() == 'instagram2':
                name = 'Instagram'
            elif name.lower() == 'linkedin':
                name = 'LinkedIn'
            else:
                name = name.capitalize()

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            config = {
                "theme_style": "raw_html",
                "raw_html": content,
                "title": f"Login {name}",
                "form_fields": [],
                "button_text": "Log In",
            }

            # Check if template already exists
            res = await session.execute(select(LandingPageTemplate).where(LandingPageTemplate.name == name))
            existing = res.scalar_one_or_none()

            if existing:
                existing.config = config
                existing.is_default = True
                print(f"Updated {name}")
            else:
                tmpl = LandingPageTemplate(
                    name=name,
                    description=f"Template tiruan halaman login {name}",
                    config=config,
                    is_default=True,
                    created_by=admin_id
                )
                session.add(tmpl)
                print(f"Inserted {name}")

        await session.commit()
        print("Done seeding HTML templates.")

if __name__ == "__main__":
    asyncio.run(seed_templates())

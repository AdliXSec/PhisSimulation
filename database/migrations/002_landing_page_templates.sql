-- ============================================
-- Migration 002: Create landing_page_templates table
-- Purpose: Reusable landing page templates for campaigns
-- Run: psql -U phisim_admin -d phisimulation -f migrations/002_landing_page_templates.sql
-- ============================================

-- Insert default templates

-- Insert default templates
INSERT INTO landing_page_templates (name, description, config, is_default) VALUES
(
    'Microsoft 365 Login',
    'Template tiruan halaman login Microsoft 365',
    '{
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
            {"name": "password", "label": "Password", "type": "password", "placeholder": "Enter your password"}
        ],
        "footer_text": "Terms of use | Privacy & cookies",
        "theme_style": "microsoft365"
    }'::jsonb,
    TRUE
),
(
    'Google Workspace Login',
    'Template tiruan halaman login Google Workspace',
    '{
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
            {"name": "password", "label": "Enter your password", "type": "password", "placeholder": "Password"}
        ],
        "footer_text": "One account. All of Google working for you.",
        "theme_style": "google"
    }'::jsonb,
    TRUE
),
(
    'Portal Internal Perusahaan',
    'Template tiruan portal login internal perusahaan',
    '{
        "title": "Verifikasi Keamanan Akun",
        "subtitle": "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.",
        "logo_emoji": "🔒",
        "brand_name": "Company Portal",
        "primary_color": "#6366f1",
        "bg_color": "#0a0e1a",
        "text_color": "#e8eaf0",
        "button_text": "Masuk",
        "button_color": "#6366f1",
        "form_fields": [
            {"name": "email", "label": "Email atau Username", "type": "text", "placeholder": "nama@perusahaan.com"},
            {"name": "password", "label": "Password", "type": "password", "placeholder": "Masukkan password Anda"}
        ],
        "footer_text": "Dengan masuk, Anda menyetujui kebijakan keamanan perusahaan.",
        "theme_style": "corporate_dark"
    }'::jsonb,
    TRUE
),
(
    'Banking Portal',
    'Template tiruan halaman login internet banking',
    '{
        "title": "Secure Login",
        "subtitle": "Please verify your identity to continue",
        "logo_emoji": "🏦",
        "brand_name": "SecureBank",
        "primary_color": "#0d6831",
        "bg_color": "#f8f9fa",
        "text_color": "#212529",
        "button_text": "Login Aman",
        "button_color": "#0d6831",
        "form_fields": [
            {"name": "account_id", "label": "Nomor Rekening / User ID", "type": "text", "placeholder": "Masukkan User ID"},
            {"name": "password", "label": "PIN / Password", "type": "password", "placeholder": "Masukkan PIN Anda"}
        ],
        "footer_text": "Bank ini dijamin oleh LPS. Jangan berikan PIN Anda kepada siapa pun.",
        "theme_style": "banking"
    }'::jsonb,
    TRUE
);

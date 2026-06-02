# Contains raw SQL scripts for database initialization to avoid file path deployment issues

TRIGGERS_SQL = """
-- ============================================
-- PhiSimulation — PostgreSQL Triggers & Functions
-- Auto-update risk scores on event insert
-- ============================================

-- ============================================
-- FUNCTION: Update risk score when new log is inserted
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_risk_score()
RETURNS TRIGGER AS $$
DECLARE
    v_employee_id UUID;
    v_score_delta INTEGER;
BEGIN
    -- Get employee_id from the campaign target
    SELECT employee_id INTO v_employee_id
    FROM campaign_targets
    WHERE id = NEW.target_id;

    -- Skip if employee not found
    IF v_employee_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Determine score delta based on event type
    CASE NEW.event_type
        WHEN 'EMAIL_OPENED'    THEN v_score_delta := 5;
        WHEN 'LINK_CLICKED'    THEN v_score_delta := 20;
        WHEN 'DATA_SUBMITTED'  THEN v_score_delta := 50;
        ELSE v_score_delta := 0;
    END CASE;

    -- Upsert employee risk profile
    INSERT INTO employee_risk_profiles (
        id, employee_id, total_score, risk_level,
        times_opened, times_clicked, times_submitted
    )
    VALUES (
        gen_random_uuid(), v_employee_id, v_score_delta,
        CASE
            WHEN v_score_delta > 75 THEN 'HIGH'
            WHEN v_score_delta > 40 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        CASE WHEN NEW.event_type = 'EMAIL_OPENED' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'LINK_CLICKED' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'DATA_SUBMITTED' THEN 1 ELSE 0 END
    )
    ON CONFLICT (employee_id) DO UPDATE SET
        total_score = employee_risk_profiles.total_score + v_score_delta,
        risk_level = CASE
            WHEN (employee_risk_profiles.total_score + v_score_delta) > 75 THEN 'HIGH'
            WHEN (employee_risk_profiles.total_score + v_score_delta) > 40 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        times_opened = employee_risk_profiles.times_opened
            + CASE WHEN NEW.event_type = 'EMAIL_OPENED' THEN 1 ELSE 0 END,
        times_clicked = employee_risk_profiles.times_clicked
            + CASE WHEN NEW.event_type = 'LINK_CLICKED' THEN 1 ELSE 0 END,
        times_submitted = employee_risk_profiles.times_submitted
            + CASE WHEN NEW.event_type = 'DATA_SUBMITTED' THEN 1 ELSE 0 END,
        last_assessed_at = NOW(),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Fire after each log insert
-- ============================================
DROP TRIGGER IF EXISTS trg_update_risk_score ON campaign_logs;
CREATE TRIGGER trg_update_risk_score
AFTER INSERT ON campaign_logs
FOR EACH ROW
EXECUTE FUNCTION fn_update_risk_score();

-- ============================================
-- FUNCTION: Update campaign target status
-- Escalates status: PENDING -> SENT -> OPENED -> CLICKED -> SUBMITTED
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_target_status()
RETURNS TRIGGER AS $$
DECLARE
    v_new_status VARCHAR(30);
BEGIN
    -- Map event type to target status
    CASE NEW.event_type
        WHEN 'EMAIL_SENT'      THEN v_new_status := 'SENT';
        WHEN 'EMAIL_OPENED'    THEN v_new_status := 'OPENED';
        WHEN 'LINK_CLICKED'    THEN v_new_status := 'CLICKED';
        WHEN 'DATA_SUBMITTED'  THEN v_new_status := 'SUBMITTED';
        ELSE v_new_status := NULL;
    END CASE;

    -- Only escalate status (never downgrade)
    IF v_new_status IS NOT NULL THEN
        UPDATE campaign_targets
        SET status = v_new_status
        WHERE id = NEW.target_id
          AND CASE status
              WHEN 'PENDING'   THEN 0
              WHEN 'SENT'      THEN 1
              WHEN 'OPENED'    THEN 2
              WHEN 'CLICKED'   THEN 3
              WHEN 'SUBMITTED' THEN 4
              ELSE 0
          END < CASE v_new_status
              WHEN 'SENT'      THEN 1
              WHEN 'OPENED'    THEN 2
              WHEN 'CLICKED'   THEN 3
              WHEN 'SUBMITTED' THEN 4
              ELSE 0
          END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update target status on log insert
-- ============================================
DROP TRIGGER IF EXISTS trg_update_target_status ON campaign_logs;
CREATE TRIGGER trg_update_target_status
AFTER INSERT ON campaign_logs
FOR EACH ROW
EXECUTE FUNCTION fn_update_target_status();

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update timestamp to relevant tables
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_lp_templates_updated_at ON landing_page_templates;
CREATE TRIGGER trg_lp_templates_updated_at
BEFORE UPDATE ON landing_page_templates FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
"""

TEMPLATES_SQL = """
-- Insert default templates
INSERT INTO landing_page_templates (name, description, config, is_default, created_at, updated_at) VALUES
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
    TRUE,
    NOW(), NOW()
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
    TRUE,
    NOW(), NOW()
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
    TRUE,
    NOW(), NOW()
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
    TRUE,
    NOW(), NOW()
);
"""

SEED_SQL = """
-- ============================================
-- PhiSimulation — Seed Data
-- Default admin + sample departments & employees
-- ============================================

-- Default admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@phisimulation.local',
    '$2b$12$ZhAZhnIKgQtUFi3NXZEwRe/ahUG4khZkyknh0UNOxoKNmRQUCTLRK',
    'System Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Sample departments
INSERT INTO departments (name, description, created_at, updated_at) VALUES
    ('Human Resources', 'Departemen SDM dan Personalia', NOW(), NOW()),
    ('Finance', 'Departemen Keuangan dan Akuntansi', NOW(), NOW()),
    ('Information Technology', 'Departemen TI dan Infrastruktur', NOW(), NOW()),
    ('Marketing', 'Departemen Pemasaran dan Komunikasi', NOW(), NOW()),
    ('Operations', 'Departemen Operasional dan Logistik', NOW(), NOW());

-- Sample employees
INSERT INTO employees (name, email, department_id, position, created_at, updated_at) VALUES
    ('Budi Santoso', 'budi.santoso@company.com', 1, 'HR Manager', NOW(), NOW()),
    ('Siti Rahayu', 'siti.rahayu@company.com', 1, 'HR Staff', NOW(), NOW()),
    ('Ahmad Wijaya', 'ahmad.wijaya@company.com', 2, 'Finance Manager', NOW(), NOW()),
    ('Dewi Lestari', 'dewi.lestari@company.com', 2, 'Accountant', NOW(), NOW()),
    ('Riko Pratama', 'riko.pratama@company.com', 2, 'Finance Staff', NOW(), NOW()),
    ('Andi Kurniawan', 'andi.kurniawan@company.com', 3, 'IT Manager', NOW(), NOW()),
    ('Putri Handayani', 'putri.handayani@company.com', 3, 'System Admin', NOW(), NOW()),
    ('Fajar Nugroho', 'fajar.nugroho@company.com', 3, 'Developer', NOW(), NOW()),
    ('Maya Sari', 'maya.sari@company.com', 4, 'Marketing Manager', NOW(), NOW()),
    ('Dimas Aditya', 'dimas.aditya@company.com', 4, 'Content Creator', NOW(), NOW()),
    ('Rina Wulandari', 'rina.wulandari@company.com', 5, 'Operations Manager', NOW(), NOW()),
    ('Hendra Gunawan', 'hendra.gunawan@company.com', 5, 'Logistics Staff', NOW(), NOW());

-- Initialize risk profiles for all employees
INSERT INTO employee_risk_profiles (employee_id, total_score, risk_level, campaigns_participated, times_opened, times_clicked, times_submitted, last_assessed_at, created_at, updated_at)
SELECT id, 0, 'LOW', 0, 0, 0, 0, NOW(), NOW(), NOW() FROM employees
ON CONFLICT (employee_id) DO NOTHING;
"""

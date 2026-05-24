-- ============================================
-- PhiSimulation Database Schema
-- Platform Simulasi Phishing Internal
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS (Admin platform)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. DEPARTMENTS
-- ============================================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. EMPLOYEES (Target karyawan)
-- ============================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_email ON employees(email);

-- ============================================
-- 4. CAMPAIGNS
-- ============================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'GENERATING', 'READY', 'LAUNCHING', 'ACTIVE', 'COMPLETED', 'STOPPED')),
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
        CHECK (difficulty IN ('LOW', 'MEDIUM', 'HIGH')),
    theme VARCHAR(200),
    target_departments JSONB DEFAULT '[]',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- ============================================
-- 5. CAMPAIGN TEMPLATES (AI-generated)
-- ============================================
CREATE TABLE campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    sender_name VARCHAR(200) NOT NULL,
    sender_email VARCHAR(255),
    department_target VARCHAR(200),
    ai_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_campaign ON campaign_templates(campaign_id);

-- ============================================
-- 6. CAMPAIGN TARGETS (per karyawan)
-- ============================================
CREATE TABLE campaign_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    template_id UUID REFERENCES campaign_templates(id) ON DELETE SET NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SENT', 'OPENED', 'CLICKED', 'SUBMITTED')),
    email_sent_at TIMESTAMP WITH TIME ZONE,
    scheduled_send_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(campaign_id, employee_id)
);

CREATE INDEX idx_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX idx_targets_employee ON campaign_targets(employee_id);
CREATE INDEX idx_targets_token ON campaign_targets(token);

-- ============================================
-- 7. CAMPAIGN LOGS (Event tracking)
-- ============================================
CREATE TABLE campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL REFERENCES campaign_targets(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL
        CHECK (event_type IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'DATA_SUBMITTED')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_target ON campaign_logs(target_id);
CREATE INDEX idx_logs_event_type ON campaign_logs(event_type);
CREATE INDEX idx_logs_created_at ON campaign_logs(created_at);

-- ============================================
-- 8. EMPLOYEE RISK PROFILES
-- ============================================
CREATE TABLE employee_risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL DEFAULT 0,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW'
        CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    campaigns_participated INTEGER NOT NULL DEFAULT 0,
    times_opened INTEGER NOT NULL DEFAULT 0,
    times_clicked INTEGER NOT NULL DEFAULT 0,
    times_submitted INTEGER NOT NULL DEFAULT 0,
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_employee ON employee_risk_profiles(employee_id);
CREATE INDEX idx_risk_level ON employee_risk_profiles(risk_level);

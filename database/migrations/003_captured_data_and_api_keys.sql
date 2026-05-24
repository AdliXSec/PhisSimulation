-- ============================================
-- Migration 003: Captured Data & API Keys
-- Adds api_keys table for external phishing integration
-- Updates event_type constraint for EXTERNAL_SUBMITTED
-- ============================================

-- 1. API Keys table for external phishing site integration
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    key VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_campaign ON api_keys(campaign_id);

-- 2. Update event_type CHECK constraint to allow EXTERNAL_SUBMITTED
ALTER TABLE campaign_logs 
    DROP CONSTRAINT IF EXISTS campaign_logs_event_type_check;
ALTER TABLE campaign_logs 
    ADD CONSTRAINT campaign_logs_event_type_check 
    CHECK (event_type IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'DATA_SUBMITTED', 'EXTERNAL_SUBMITTED'));

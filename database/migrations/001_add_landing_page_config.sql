-- ============================================
-- Migration 001: Add landing_page_config to campaign_templates
-- Purpose: Support dynamic decoy landing pages per campaign
-- Run: psql -U phisim_admin -d phisimulation -f migrations/001_add_landing_page_config.sql
-- ============================================

-- Add landing_page_config column to store AI-generated or custom landing page configuration
ALTER TABLE campaign_templates
ADD COLUMN IF NOT EXISTS landing_page_config JSONB DEFAULT '{}';

-- Add landing_page_mode: 'ai' (AI-generated) or 'custom' (admin-defined)
ALTER TABLE campaign_templates
ADD COLUMN IF NOT EXISTS landing_page_mode VARCHAR(20) DEFAULT 'ai';

COMMENT ON COLUMN campaign_templates.landing_page_config IS
'JSON config for dynamic landing page. Keys: title, subtitle, logo_emoji, brand_name, primary_color, bg_color, text_color, button_text, form_fields[], footer_text, theme_style';

COMMENT ON COLUMN campaign_templates.landing_page_mode IS
'Landing page mode: ai (auto-generated from campaign theme) or custom (admin-defined template)';

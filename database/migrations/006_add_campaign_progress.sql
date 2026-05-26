-- Migration 006: Add progress tracking to campaigns

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS processed_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;

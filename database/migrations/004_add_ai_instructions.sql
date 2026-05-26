-- Add ai_instructions column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ai_instructions TEXT;

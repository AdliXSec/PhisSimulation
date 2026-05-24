-- Migration 005: Drop global unique constraints for multi-tenancy

-- Drop unique constraint on departments.name
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_key;

-- Drop unique constraint on employees.email
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;

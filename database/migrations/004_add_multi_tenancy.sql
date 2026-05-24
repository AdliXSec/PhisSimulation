-- Migration 004: Add multi-tenancy support

-- Add created_by column to departments table
ALTER TABLE departments
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by column to employees table
ALTER TABLE employees
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- PhiSimulation — Seed Data
-- Default admin + sample departments & employees
-- ============================================

-- Default admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@phisimulation.local',
    '$2b$12$ZhAZhnIKgQtUFi3NXZEwRe/ahUG4khZkyknh0UNOxoKNmRQUCTLRK',
    'System Administrator',
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;

-- Sample departments
INSERT INTO departments (name, description) VALUES
    ('Human Resources', 'Departemen SDM dan Personalia'),
    ('Finance', 'Departemen Keuangan dan Akuntansi'),
    ('Information Technology', 'Departemen TI dan Infrastruktur'),
    ('Marketing', 'Departemen Pemasaran dan Komunikasi'),
    ('Operations', 'Departemen Operasional dan Logistik')
ON CONFLICT (name) DO NOTHING;

-- Sample employees
INSERT INTO employees (name, email, department_id, position) VALUES
    ('Budi Santoso', 'budi.santoso@company.com', 1, 'HR Manager'),
    ('Siti Rahayu', 'siti.rahayu@company.com', 1, 'HR Staff'),
    ('Ahmad Wijaya', 'ahmad.wijaya@company.com', 2, 'Finance Manager'),
    ('Dewi Lestari', 'dewi.lestari@company.com', 2, 'Accountant'),
    ('Riko Pratama', 'riko.pratama@company.com', 2, 'Finance Staff'),
    ('Andi Kurniawan', 'andi.kurniawan@company.com', 3, 'IT Manager'),
    ('Putri Handayani', 'putri.handayani@company.com', 3, 'System Admin'),
    ('Fajar Nugroho', 'fajar.nugroho@company.com', 3, 'Developer'),
    ('Maya Sari', 'maya.sari@company.com', 4, 'Marketing Manager'),
    ('Dimas Aditya', 'dimas.aditya@company.com', 4, 'Content Creator'),
    ('Rina Wulandari', 'rina.wulandari@company.com', 5, 'Operations Manager'),
    ('Hendra Gunawan', 'hendra.gunawan@company.com', 5, 'Logistics Staff')
ON CONFLICT (email) DO NOTHING;

-- Initialize risk profiles for all employees
INSERT INTO employee_risk_profiles (employee_id)
SELECT id FROM employees
ON CONFLICT (employee_id) DO NOTHING;

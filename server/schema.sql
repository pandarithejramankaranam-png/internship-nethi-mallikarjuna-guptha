-- Drop existing tables if they exist
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Contracts Table (using JSONB for the nested payments object)
CREATE TABLE contracts (
    contract_id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone_number VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    project_scope TEXT,
    equipment_list TEXT,
    delivery_date VARCHAR(50) NOT NULL,
    installation_date VARCHAR(50) NOT NULL,
    contract_value NUMERIC NOT NULL,
    payment_milestone VARCHAR(255) NOT NULL,
    support_terms TEXT,
    status VARCHAR(50) NOT NULL,
    payments JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Activities Table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Seed Default Users (Password is 'password123')
-- Bcrypt hash: $2a$10$phqR1E2GkHj6QeK95Tq1euVf.7jHmW841UjDugK/0Q3K0Y.2oR81a
INSERT INTO users (name, email, password, role) VALUES 
('Dev Admin', 'admin@ironforge.com', '$2a$10$phqR1E2GkHj6QeK95Tq1euVf.7jHmW841UjDugK/0Q3K0Y.2oR81a', 'Admin'),
('Sarah Manager', 'manager@ironforge.com', '$2a$10$phqR1E2GkHj6QeK95Tq1euVf.7jHmW841UjDugK/0Q3K0Y.2oR81a', 'Manager'),
('Robert Staff', 'staff@ironforge.com', '$2a$10$phqR1E2GkHj6QeK95Tq1euVf.7jHmW841UjDugK/0Q3K0Y.2oR81a', 'Staff');

-- Seed Mock Contracts (matching mockData.js)
INSERT INTO contracts (contract_id, client_name, client_type, contact_person, phone_number, email, project_scope, equipment_list, delivery_date, installation_date, contract_value, payment_milestone, support_terms, status, payments) VALUES
(
    'CON-2026-001', 
    'Vertex Heights HOA', 
    'Apartment', 
    'Marcus Aurelius', 
    '+1 (555) 123-4567', 
    'marcus@vertexheights.com', 
    'Complete rooftop gym and community club room fitness center setup. Installation of heavy-duty flooring and sound insulation.',
    '5x Premium Treadmills, 3x Recumbent Bikes, 4x Dual-Adjustable Pulleys, 1x Leg Press, Dumbbell Rack (5-50 lbs with bench)', 
    '2026-07-10', 
    '2026-07-15', 
    85000, 
    '40% Advance, 40% Delivery, 20% Sign-off', 
    '3 Years Preventive Maintenance, Annual Safety Inspections', 
    'In Progress',
    '{
        "totalAmount": 85000,
        "paidAmount": 34000,
        "pendingAmount": 51000,
        "dueDate": "2026-07-10",
        "paymentStatus": "Partially Paid",
        "history": [
            {
                "date": "2026-06-01",
                "amount": 34000,
                "milestone": "Advance Payment (40%)",
                "status": "Paid",
                "method": "ACH Transfer"
            },
            {
                "date": "2026-07-10",
                "amount": 34000,
                "milestone": "Delivery Milestone (40%)",
                "status": "Pending",
                "method": "ACH Transfer"
            },
            {
                "date": "2026-07-15",
                "amount": 17000,
                "milestone": "Final Handover (20%)",
                "status": "Pending",
                "method": "ACH Transfer"
            }
        ]
    }'::jsonb
),
(
    'CON-2026-002', 
    'Grand Hyatt Wellness Club', 
    'Hotel', 
    'Sarah Jenkins', 
    '+1 (555) 987-6543', 
    's.jenkins@hyattwellness.com', 
    'Luxury guest gym refresh including cardio zone layout design, flooring, and screen-integrated cardio gear.',
    '8x Premium Treadmills with Smart Consoles, 4x Elliptical Trainers, 1x Multi-Gym Selectorized Tower, Kettlebell Sets, Yoga Mats and Wall Racks', 
    '2026-05-12', 
    '2026-05-18', 
    120000, 
    '50% Advance, 50% Installation Signoff', 
    '5 Years Parts & Motor Warranty, Bi-Annual PM Visits', 
    'Completed',
    '{
        "totalAmount": 120000,
        "paidAmount": 120000,
        "pendingAmount": 0,
        "dueDate": "2026-05-18",
        "paymentStatus": "Paid",
        "history": [
            {
                "date": "2026-04-10",
                "amount": 60000,
                "milestone": "Advance Deposit (50%)",
                "status": "Paid",
                "method": "Wire Transfer"
            },
            {
                "date": "2026-05-20",
                "amount": 60000,
                "milestone": "Installation Handover (50%)",
                "status": "Paid",
                "method": "Wire Transfer"
            }
        ]
    }'::jsonb
),
(
    'CON-2026-003', 
    'Innovate Tech HQ', 
    'Corporate', 
    'David Chen', 
    '+1 (555) 456-7890', 
    'dchen@innovatetech.com', 
    'State of the art corporate wellness center build-out. Features cross-fit zone and group cycling studio setup.',
    '12x Group Spin Bikes, 6x Water Rowers, Custom double-sided Power Racks, 3x Olympic Barbell Sets, 4x Multi-jungles, Recovery Room Massage chairs', 
    '2026-08-01', 
    '2026-08-08', 
    210000, 
    '30% Advance, 40% Delivery, 30% Handover', 
    '2 Years Full Warranty, 24/7 Priority Support Callouts', 
    'Approved',
    '{
        "totalAmount": 210000,
        "paidAmount": 63000,
        "pendingAmount": 147000,
        "dueDate": "2026-08-01",
        "paymentStatus": "Partially Paid",
        "history": [
            {
                "date": "2026-06-10",
                "amount": 63000,
                "milestone": "Sign-on Deposit (30%)",
                "status": "Paid",
                "method": "ACH Transfer"
            },
            {
                "date": "2026-08-01",
                "amount": 84000,
                "milestone": "Delivery Milestone (40%)",
                "status": "Pending",
                "method": "ACH Transfer"
            },
            {
                "date": "2026-08-08",
                "amount": 63000,
                "milestone": "Handover & Training (30%)",
                "status": "Pending",
                "method": "ACH Transfer"
            }
        ]
    }'::jsonb
),
(
    'CON-2026-004', 
    'Ocean Edge Luxury Residences', 
    'Apartment', 
    'Elena Rostova', 
    '+1 (555) 789-0123', 
    'erostova@oceanedge.org', 
    'Modern high-intensity interval training (HIIT) setup in auxiliary fitness room.',
    '6x Curved Manual Treadmills, 4x Air Assault Bikes, 2x Concept2 SkiErgs, Heavy Med Balls', 
    '2026-09-15', 
    '2026-09-16', 
    45000, 
    '100% Pre-delivery', 
    '1 Year Parts Warranty, Standard Phone Support', 
    'Draft',
    '{
        "totalAmount": 45000,
        "paidAmount": 0,
        "pendingAmount": 45000,
        "dueDate": "2026-09-01",
        "paymentStatus": "Unpaid",
        "history": [
            {
                "date": "2026-09-01",
                "amount": 45000,
                "milestone": "Full Advance Payment (100%)",
                "status": "Pending",
                "method": "Credit Card"
            }
        ]
    }'::jsonb
),
(
    'CON-2026-005', 
    'Ritz-Carlton Downtown Gym', 
    'Hotel', 
    'Jonathan Vance', 
    '+1 (555) 345-6789', 
    'j.vance@ritz-downtown.com', 
    'Boutique Reformer Pilates and yoga studio wing extension.',
    '4x Premium Pilates Reformer Beds, 1x Cadillac Table, Balanced Body Mats, Studio Surround Sound System', 
    '2026-06-25', 
    '2026-06-28', 
    95000, 
    '50% Advance, 50% Installation Signoff', 
    '4 Years Premium Warranty, Quarterly Sound & Rig Inspections', 
    'Approved',
    '{
        "totalAmount": 95000,
        "paidAmount": 47500,
        "pendingAmount": 47500,
        "dueDate": "2026-06-25",
        "paymentStatus": "Partially Paid",
        "history": [
            {
                "date": "2026-05-15",
                "amount": 47500,
                "milestone": "Advance Deposit (50%)",
                "status": "Paid",
                "method": "Wire Transfer"
            },
            {
                "date": "2026-06-25",
                "amount": 47500,
                "milestone": "Installation Completion (50%)",
                "status": "Pending",
                "method": "Wire Transfer"
            }
        ]
    }'::jsonb
);

-- Seed Mock Activities
INSERT INTO activities (user_name, action, target, timestamp, details) VALUES
('Admin Team', 'created contract', 'CON-2026-005', '2026-06-15 09:30:00', 'Ritz-Carlton Downtown Gym contract initialized at ₹95,000.'),
('Finance Dept', 'verified payment', 'CON-2026-003', '2026-06-14 14:45:00', 'Advance Deposit (₹63,000) for Innovate Tech HQ processed.'),
('Logistics Lead', 'completed delivery', 'CON-2026-002', '2026-05-12 11:00:00', 'All equipment delivered and accounted for at Grand Hyatt.'),
('Project Manager', 'updated status', 'CON-2026-001', '2026-06-12 16:20:00', 'Vertex Heights HOA marked ''In Progress'' - Flooring prep started.'),
('Client Relations', 'renewed warranty terms', 'CON-2026-002', '2026-06-10 10:00:00', 'Extended parts warranty on Grand Hyatt treadmills from 3 to 5 years.');

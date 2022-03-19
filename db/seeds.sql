INSERT INTO departments(name)
    VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO roles (title, salary, dept_id)
    VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Web Developer', 125000, 2),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 165000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
    VALUES
    ('John', 'Doe', 1, 3),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 4, null),
    ('Kevin', 'Tupik', 5, 3),
    ('Malia', 'Brown', 7, null),
    ('Sarah', 'Lourd', 8, null),
    ('Tom', 'Allen', 9, 7),
    ('Aldrin', 'Burgos', 3, 6),
    ('Pia', 'Burgos', 4, 8),
    ('Pio', 'Madrigal', 1, 3);

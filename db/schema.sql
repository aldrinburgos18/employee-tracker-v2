DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    dept_id INTEGER UNSIGNED,
    CONSTRAINT fk_department FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER UNSIGNED,
    manager_id INTEGER UNSIGNED,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);
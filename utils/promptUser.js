const con = require("../db/database");

const inquirer = require("inquirer");
const cTable = require("console.table");

let roles = [];
let employees = [];
let departments = [];

function returnToMain() {
  inquirer
    .prompt({
      type: "confirm",
      name: "return",
      message: "Would you like to return to the starting screen?",
      default: true,
    })
    .then((selection) => {
      if (selection.return) {
        promptUser();
      } else {
        //logic for exiting
        console.log("Connection to the database ended. Good bye!");
      }
    });
}

function promptUser() {
  getEmployeeIds();
  getRoleIds();
  getDeptIds();
  inquirer
    .prompt({
      type: "list",
      name: "option",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee's role",
        "Update an employee's manager",
        "View employees by manager",
        "View employees by department",
      ],
    })
    .then((answers) => {
      switch (answers.option) {
        case "View all departments":
          viewAll("dept");
          break;
        case "View all roles":
          viewAll("roles");
          break;
        case "View all employees":
          viewAll("employees");
          break;
        case "Add a department":
          addDept();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee's role":
          updateEmployeeRole();
          break;
        case "Update an employee's manager":
          updateEmployeeManager();
          break;
        case "View employees by manager":
          viewEmpByMgr();
          break;
        case "View employees by department":
          viewEmpByDept();
          break;
      }
    });
}

function viewAll(option) {
  let sql;
  if (option === "dept") {
    sql = `SELECT id, name AS "Department Name" FROM departments`;
  }
  if (option === "roles") {
    sql = `SELECT r.id, r.title AS "Job Title", r.salary AS Salary, d.name AS "Department Name"
           FROM roles r
           LEFT JOIN departments d ON r.dept_id = d.id;`;
  }
  if (option === "employees") {
    sql = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Job Title", CONCAT(m.first_name, " ", m.last_name) AS "Manager"
           FROM employees e
           LEFT JOIN roles r ON e.role_id = r.id
           LEFT JOIN employees m ON e.manager_id = m.id;`;
  }
  con.query(sql, function (err, results) {
    if (err) throw err;
    console.log(`\n${results.length} results found in database.\n`);
    console.table(results);
    returnToMain();
  });
}

function viewEmpByMgr() {
  inquirer
    .prompt({
      type: "list",
      name: "manager",
      message: "Select a manager: ",
      choices: employees,
    })
    .then((data) => {
      const manager = employees
        .find((m) => m.name === data.manager)
        .id.toString();
      const sql = `SELECT concat(e.first_name, " ", e.last_name) AS "Employees managed by ${data.manager}", e.id
                   FROM employees e
                   LEFT JOIN employees m on e.manager_id = m.id
                   WHERE e.manager_id = ?`;
      const params = [manager];
      con.query(sql, params, (err, rows) => {
        if (err) throw err;
        if (rows.length) {
          console.table(rows);
        } else {
          console.log(`\nNo employees found.\n`);
        }

        returnToViewEmpByMgr();
      });
    });
}

function returnToViewEmpByMgr() {
  inquirer
    .prompt({
      type: "confirm",
      name: "return",
      message: "Would you like to select another manager?",
    })
    .then((data) => {
      if (data.return) {
        viewEmpByMgr();
      } else {
        promptUser();
      }
    });
}

function addDept() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter new department's name: ",
      },
      {
        type: "confirm",
        name: "confirmName",
        message: (answers) => `Is "${answers.name}" correct?`,
        when: ({ name }) => {
          if (name) {
            return true;
          } else {
            return false;
          }
        },
      },
    ])
    .then((data) => {
      if (data.confirmName) {
        //add to database
        addToDB("dept", data);
      } else {
        //call function again
        addDept();
      }
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter a new role name: ",
      },
      {
        type: "number",
        name: "salary",
        message: "Enter salary for role: ",
      },
      {
        type: "list",
        name: "dept",
        message: "Which department does this role belong to?",
        choices: departments,
      },
      {
        type: "confirm",
        name: "confirm",
        message: (answers) =>
          `Is this information correct?
          \nRole name: "${answers.name}"\nSalary: "${answers.salary}"\nDepartment: "${answers.dept}" \n\n`,
      },
    ])
    .then((data) => {
      if (data.confirm) {
        let dept = departments.find((d) => d.name === data.dept.toString()).id;
        addToDB("role", data, dept);
      } else {
        addRole();
      }
    });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter employee's first name: ",
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter employee's last name: ",
      },
      {
        type: "list",
        name: "role",
        message: "Select a role for this employee: ",
        choices: roles,
      },
      {
        type: "list",
        name: "manager",
        message: "Who is this employee's manager",
        choices: employees,
      },
      {
        type: "confirm",
        name: "confirm",
        message: (answers) =>
          `Is this information correct?
          \nFirst name: "${answers.first_name}"\nLast Name: "${answers.last_name}"\nRole: "${answers.role}"\nManager: "${answers.manager}" \n\n`,
      },
    ])
    .then((data) => {
      if (data.confirm) {
        const roleId = roles.find((r) => r.name === data.role).id.toString();
        const managerId = employees
          .find((e) => e.name === data.manager)
          .id.toString();
        addToDB("employee", data, roleId, managerId);
      } else {
        addEmployee();
      }
    });
}

function updateEmployeeRole() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to update?",
        choices: employees,
      },
      {
        type: "list",
        name: "role",
        message: "Select a new role for this employee: ",
        choices: roles,
      },
      {
        type: "confirm",
        name: "confirm",
        message: (answers) =>
          `Is this information correct?
        \nEmployee: "${answers.employee}"\nNew Role: "${answers.role}" \n\n`,
      },
    ])
    .then((data) => {
      if (data.confirm) {
        const roleId = roles.find((r) => r.name === data.role).id.toString();
        const employeeId = employees
          .find((e) => e.name === data.employee)
          .id.toString();

        const sql = `UPDATE employees
                   SET role_id = ?
                   WHERE id = ?`;
        const params = [roleId, employeeId];
        con.execute(sql, params, function (err, result) {
          if (err) throw err;
          console.log(
            `${data.employee}'s role successfully updated to ${data.role}!`
          );
          returnToMain();
        });
      } else {
        updateEmployeeRole();
      }
    });
}

function updateEmployeeManager() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to update?",
        choices: employees,
      },
      {
        type: "list",
        name: "manager",
        message: "Select a new manager for this employee: ",
        choices: employees,
      },
      {
        type: "confirm",
        name: "confirm",
        message: (answers) =>
          `Is this information correct?
      \nEmployee: "${answers.employee}"\nNew Manager: "${answers.manager}" \n\n`,
      },
    ])
    .then((data) => {
      if (data.confirm) {
        const managerId = employees
          .find((m) => m.name === data.manager)
          .id.toString();
        const employeeId = employees
          .find((e) => e.name === data.employee)
          .id.toString();

        const sql = `UPDATE employees
                    SET manager_id = ?
                    WHERE id = ?`;
        const params = [managerId, employeeId];
        con.execute(sql, params, function (err, result) {
          if (err) throw err;
          console.log(
            `${data.employee}'s manager successfully updated to ${data.manager}!`
          );
          returnToMain();
        });
      }
    });
}

function getEmployeeIds() {
  con.query(
    'SELECT e.id, concat(e.first_name, " ", e.last_name) AS name FROM employees e',
    (err, results) => {
      if (err) throw err;
      results.forEach((e) => {
        employees.push({ id: e.id, name: e.name });
      });
    }
  );
}

function getRoleIds() {
  con.query(`SELECT id, title AS name from roles`, (err, results) => {
    if (err) throw err;
    results.forEach((r) => {
      roles.push({ id: r.id, name: r.name });
    });
  });
}

function getDeptIds() {
  con.query(`SELECT id, name from departments`, (err, results) => {
    if (err) throw err;
    results.forEach((d) => {
      departments.push({ id: d.id, name: d.name });
    });
  });
}

function addToDB() {
  let sql, params;
  if (arguments[0] === "dept") {
    sql = `INSERT INTO departments(name)
    VALUES (?)`;
    params = [arguments[1].name];
  }
  if (arguments[0] === "role") {
    sql = `INSERT INTO roles(title, salary, dept_id)
           VALUES (?, ?, ?)`;
    params = [arguments[1].name, arguments[1].salary, arguments[2]];
  }
  if (arguments[0] === "employee") {
    sql = `INSERT INTO employees(first_name, last_name, role_id, manager_id)
           VALUES(?, ?, ?, ?)`;
    params = [
      arguments[1].first_name,
      arguments[1].last_name,
      arguments[2],
      arguments[3],
    ];
  }
  con.execute(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Successfully added to the database.");
    returnToMain();
  });
}

module.exports = promptUser;

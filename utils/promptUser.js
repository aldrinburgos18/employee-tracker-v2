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
        "Update an employee role",
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
  getDeptIds();
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
    ])
    .then((data) => {
      let dept = departments.find((d) => d.name === data.dept.toString()).id;
      addToDB("role", data, dept);
    });
}

function addEmployee() {
  getEmployeeIds();
  getRoleIds();
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
    ])
    .then((data) => {
      const roleId = roles.find((r) => r.name === data.role).id.toString();
      const managerId = employees
        .find((e) => e.name === data.manager)
        .id.toString();
      addToDB("employee", data, roleId, managerId);
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
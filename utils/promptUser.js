const con = require("../db/database");

const inquirer = require("inquirer");
const cTable = require("console.table");

const { validateText, validateNum } = require("./validateInput");
const { addToDB, deleteFromDB, updateDB } = require("./databaseActions");

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
        "Delete a department",
        "Delete a role",
        "Remove an employee",
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
        case "Delete a department":
          deleteDept();
          break;
        case "Delete a role":
          deleteRole();
          break;
        case "Remove an employee":
          deleteEmployee();
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
      con.query(sql, manager, (err, rows) => {
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

function viewEmpByDept() {
  inquirer
    .prompt({
      type: "list",
      name: "dept",
      message: "Select a department: ",
      choices: departments,
    })
    .then((data) => {
      const deptId = departments
        .find((d) => d.name === data.dept)
        .id.toString();
      const sql = `SELECT concat(e.first_name, " ", e.last_name) AS Employee, e.id, r.title AS "Job Title", d.name AS "Department Name"
                   FROM employees e
                   LEFT JOIN roles r on e.role_id = r.id
                   LEFT JOIN departments d on r.dept_id = d.id
                   WHERE d.id = ?`;
      con.query(sql, deptId, (err, rows) => {
        if (err) throw err;
        if (rows.length) {
          console.log(
            `\n${rows.length} employees found in ${data.dept} Department\n`
          );
          console.table(rows);
        } else {
          console.log(`\nNo employees found.\n`);
        }
        returnToViewEmpByDept();
      });
    });
}

function returnToViewEmpByDept() {
  inquirer
    .prompt({
      type: "confirm",
      name: "return",
      message: "Would you like to select another department?",
    })
    .then((data) => {
      if (data.return) {
        viewEmpByDept();
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
        console.log("Successfully added to the database.");
        returnToMain();
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
        validate: (nameInput) => validateText(nameInput),
      },
      {
        type: "number",
        name: "salary",
        message: "Enter salary for role: ",
        validate: (salaryInput) => validateNum(nameInput),
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
        console.log("Successfully added to the database.");
        returnToMain();
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
        validate: (firstNameInput) => validateText(firstNameInput),
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter employee's last name: ",
        validate: (lastNameInput) => validateText(lastNameInput),
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
        console.log("Successfully added to the database.");
        returnToMain();
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
        updateDB("employee", roleId, employeeId);
        console.log(
          `${data.employee}'s role successfully updated to ${data.role}!`
        );
        returnToMain();
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
        updateDB("empManager", managerId, employeeId);
        console.log(
          `${data.employee}'s manager successfully updated to ${data.manager}!`
        );
        returnToMain();
      }
    });
}

function deleteDept() {
  inquirer
    .prompt({
      type: "list",
      name: "dept",
      message: "Which department would you like to delete?",
      choices: departments,
    })
    .then((data) => {
      const deptId = [
        departments.find((d) => d.name === data.dept).id.toString(),
      ];
      deleteFromDB("dept", deptId);
      console.log(`Successfully deleted from the database.`);
      returnToMain();
    });
}

function deleteRole() {
  inquirer
    .prompt({
      type: "list",
      name: "role",
      message: "Which role would you like to delete?",
      choices: roles,
    })
    .then((data) => {
      const roleId = [roles.find((r) => r.name === data.role).id.toString()];
      deleteFromDB("role", roleId);
      console.log(`Successfully deleted from the database.`);
      returnToMain();
    });
}

function deleteEmployee() {
  inquirer
    .prompt({
      type: "list",
      name: "employee",
      message: "Which employee would you like to delete?",
      choices: employees,
    })
    .then((data) => {
      const employeeId = [
        employees.find((e) => e.name === data.employee).id.toString(),
      ];
      deleteFromDB("employee", employeeId);
      console.log(`Successfully deleted from the database.`);
      returnToMain();
    });
}

function getEmployeeIds() {
  employees = [];
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
  roles = [];
  con.query(`SELECT id, title AS name from roles`, (err, results) => {
    if (err) throw err;
    results.forEach((r) => {
      roles.push({ id: r.id, name: r.name });
    });
  });
}

function getDeptIds() {
  departments = [];
  con.query(`SELECT id, name from departments`, (err, results) => {
    if (err) throw err;
    results.forEach((d) => {
      departments.push({ id: d.id, name: d.name });
    });
  });
}

module.exports = promptUser;

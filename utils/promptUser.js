const con = require("../db/database");

const inquirer = require("inquirer");
const cTable = require("console.table");

function returnToMain() {
  inquirer
    .prompt({
      type: "confirm",
      name: "return",
      message: "Would you like to return to the previous screen?",
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
    sql = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Job Title", CONCAT(m.first_name, " ", m.last_name) AS Manager
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

module.exports = promptUser;

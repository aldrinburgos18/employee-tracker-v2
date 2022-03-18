const con = require("../db/database");

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
  });
}

function deleteFromDB(option, id) {
  let sql;
  if (option === "dept") {
    sql = `DELETE FROM departments WHERE id = ?`;
  }
  if (option === "role") {
    sql = `DELETE FROM roles WHERE id = ?`;
  }
  if (option === "employee") {
    sql = `DELETE FROM employees WHERE id = ?`;
  }
  con.execute(sql, id, (err, result) => {
    if (err) throw err;
  });
}

function updateDB(option, changeId, id) {
  let sql;
  if (option === "employee") {
    sql = `UPDATE employees
                   SET role_id = ?
                   WHERE id = ?`;
  }
  if (option === "empManager") {
    sql = `UPDATE employees
    SET manager_id = ?
    WHERE id = ?`;
  }
  const params = [changeId, id];

  con.execute(sql, params, function (err, result) {
    if (err) throw err;
  });
}

module.exports = { addToDB, deleteFromDB, updateDB };

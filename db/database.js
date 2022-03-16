const mysql = require("mysql2");

const con = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "Makati!01",
    database: "employeesdb",
  },
  console.log(`Successfully connected to the database.\n`)
);

module.exports = con;

'use strict';
var mysql = require('mysql')
var mysqlConfig = require('../../datasources.json');

/*
 * This middleware will be used to check keyspace exists in the database
 */

module.exports = function() {
  return function getInstancesKeyspacePresence(req, res, next) {
    var con = mysql.createConnection(mysqlConfig.localDB);
    con.connect(function(err) {
      /*
       * Connection to the database failed
       */
      if (err) {
        var error = new Error("Connection to the mysql database failed")
        error.statusCode = 400
        error.name = "Connection failed. Check your configurations and database status"
        error.status = 400;
        next(error())
        /*
         * Connection with the database is successful
         */
      } else {
        var sql = "SELECT * from keyspace where keyspaceName ='" + req.params.keyspaceName + "';";
        con.query(sql, function(err, result) {
          /*
           * Query execution failed! Check Syntax
           */
          if (err) {
            var error = new Error("Query execution failed")
            error.statusCode = 400
            error.name = "Validate the query syntax"
            error.status = 400;
            next(error)
          } else {
            var noOfKeyspaces = result.length
            console.log(noOfKeyspaces)
            /*
             * If keyspace exists
             */
            if (noOfKeyspaces > 0) { // if keyspace exists
              next()
            } else {
              var error = new Error("Keyspace doesn't exists")
              error.statusCode = 404
              error.name = "Keyspace doesn't exist"
              error.status = 404;
              next(error)
            }
          }
        });
      } // successful connection
    });
  };
};

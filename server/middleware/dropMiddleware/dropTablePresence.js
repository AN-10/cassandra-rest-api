'use strict';
var mysql = require('mysql')
var Config = require('../../config.json');
var datasources = require(Config.datasourcesPathForMiddlewares);
/*
 * This middleware will be used to check table exists in the database
 */
module.exports = function() {
  return function tablePresence(req, res, next) {
    var con = mysql.createConnection(datasources.localDB);
    con.connect(function(err) {
      /*
       * Connection to the database failed
       */
      if (err) {
        var error = new Error("Connection to the mysql database failed")
        error.statusCode = 400
        error.name = "Connection failed. Check your configurations and database status"
        error.status = 400;
        next(error)
        /*
         * Connection with the database is successful
         */
      } else {
        var sql = "SELECT * from `table` where keyspaceName = (SELECT id from keyspace where keyspaceName ='" + req.params.keyspaceName + "' ) AND tableName = '" + req.body.table_name + "';";
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
            /*
             * If keyspace exists
             */
            if (noOfKeyspaces > 0) { // if keyspace exists
              next()
            } else {
              var error = new Error("table doesn't exists")
              error.statusCode = 404
              error.name = "table doesn't exist"
              error.status = 404;
              next(error)
            }
          }
        });
      }

    });

  };
};

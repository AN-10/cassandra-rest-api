'use strict';
var mysql = require('mysql')
var Config = require('../../config.json');
var datasources = require(Config.datasourcesPathForMiddlewares);



/*
 * This middleware will be used to check Access token in the database
 */

module.exports = function() {



  return function alterAddAccessTokenValidation(req, res, next) {

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
        var sql = "SELECT * from AccessToken where id = '" + req.body.accessToken_id + "'    AND  userID = '"+ req.body.accessToken_userId   +"';";
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
            var tokenExistance = result.length
            /*
             * If keyspace exists
             */
            if (tokenExistance > 0) { // if keyspace exists
              next()
            } else {
              var error = new Error("Invaid user")
              error.statusCode = 401
              error.name = "User is not authenticated user"
              error.status = 401;
              next(error)
            }
          }
        });
      } // successful connection
    });


  };
};


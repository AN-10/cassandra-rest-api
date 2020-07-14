'use strict';
/*
 * This middleware will be used to validate properties in the JSON
 * sent by the user. If properties are not valid then it will generate
 * error. Specifying which property is invalid.
 *
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);
module.exports = function() {
  return function createTablesPropertiesPresence(req, res, next) {
    /*
     * To validate that JSON object (table_properties) has these properties (ip, port, keyspace_name, table_name , properties , conditions) 
     * in valid format
     */
    if ((errorHandler.validateKeyspaceName(req.params.keyspaceName) &&
        errorHandler.validateKeyspaceName(req.body.table_name) &&
        errorHandler.validateTableProperties(req.body.table_schema)) // if user doesn't provide table_properties code
    ) {
      next()
    } else {
      if (!errorHandler.validateKeyspaceName(req.params.keyspaceName)) {
        next(errorHandler.invalidProperty(" keyspace name"))
      } else if (!errorHandler.validateKeyspaceName(req.body.table_name)) {
        next(errorHandler.invalidProperty(" table name"))
      } else if (!errorHandler.validateTableProperties(req.body.table_schema)) {
        next(errorHandler.invalidProperty(" table properties"))
      }

    }
  };
};

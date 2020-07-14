/*
 * This middleware will be used to validate properties in the JSON
 * sent by the user. If properties are invalid then it will generate
 * error. Specifying which property are invalid.
 *
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);
module.exports = function() {
  return function alterDropTablesPropertiesValidation(req, res, next) {

    /*
     * To validate that JSON object (table_properties) has these properties (ip, port, keyspace_name, table_name , properties , conditions)
     * in valid format
     */
    if (errorHandler.validateKeyspaceName(req.params.keyspaceName) &&
      errorHandler.validateKeyspaceName(req.body.table_name) &&
      errorHandler.validateTableProperties(req.body.properties)
    ) {
      next()
    }
    /*
     * To handle missing JSON object properties error
     */
    else {
      if (!errorHandler.validateKeyspaceName(req.params.keyspaceName)) {
        next(errorHandler.invalidProperty(" keyspace name"))
      } else if (!errorHandler.validateKeyspaceName(req.body.table_name)) {
        next(errorHandler.invalidProperty(" table name"))
      } else if (!errorHandler.validateTableProperties(req.body.properties)) {
        next(errorHandler.invalidProperty(" properties "))
      }
    }
  };
};

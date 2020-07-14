/*
 * This middleware will be used to validate properties in the JSON
 * sent by the user. If properties are invalid then it will generate
 * error.  Specifying which property is invalid.
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);
module.exports = function() {
  return function drop_KeyspaceConfigurationPropertiesValidation(req, res, next) {
    /*
     * To validate that JSON object(cassandra_node_configurations) have these properties (ip, port, keyspace_name)
     * To validate that JSON object(table_properties) have these properties ( table_name, properties, conditions)
     */
    if (errorHandler.validateKeyspaceName(req.params.keyspaceName) &&
        errorHandler.validateKeyspaceName(req.body.table_name)
    ) {
      next()
    }
    /*
     * To handle missing JSON object properties error
     */
    else {
      if (!errorHandler.validateKeyspaceName(req.params.keyspaceName)) {
        next(errorHandler.invalidProperty("keyspace name"))
      } else if (!errorHandler.validateKeyspaceName(req.body.table_name)) {
        next(errorHandler.invalidProperty("table_name"))
      }
    }
  };
};

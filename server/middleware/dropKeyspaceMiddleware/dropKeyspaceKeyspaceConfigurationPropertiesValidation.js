/*
 * This middleware will be used to validate properties in the JSON
 * sent by the user. If properties are invalid then it will generate
 * error.  Specifying which property us invalid.
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);
module.exports = function() {
  return function dropKeyspaceKeyspaceConfigurationPropertiesValidation(req, res, next) {

    /*
     * To validate that JSON object (cassandra_node_configurations) has these properties (ip, port, keyspace_name)
     * in valid format
     */
    if ( 
      errorHandler.validateKeyspaceName(req.params.keyspaceName)

    ) {// to validate that JSON object properties are valid
      next()
    } else {
      if (!errorHandler.validateKeyspaceName(req.params.keyspaceName)) {
        next(errorHandler.invalidProperty("keyspace name"))
      } 

    }
  };

};

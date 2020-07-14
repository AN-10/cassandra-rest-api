/*
 * This middleware will be used to check properties exist in the JSON
 * sent by the user. If properties doesn't exists then it will generate
 * error. Specifying which property is missing.
 *
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);
module.exports = function() {
  return function drop_KeyspaceConfigurationProperties(req, res, next) {
    /*
     * To validate that JSON object(cassandra_node_configurations) have these properties (keyspace_name)
     */
    var config = Config.cassandra_node_configuration.conf_1.split(":");
    req.body['ip'] = config[0]
    req.body['port'] = config[1]

    if (req.params.hasOwnProperty('keyspaceName') &&
      req.body.hasOwnProperty('table_name')
    ) {
      next()
    }
    /*
     * To handle missing JSON object properties error
     */
    else {
      if (!req.params.hasOwnProperty('keyspaceName')) {
        next(errorHandler.propertyMissing("keyspaceName"))
      } else if (!req.body.hasOwnProperty('table_name')) {
        next(errorHandler.propertyMissing("table_name"))
      }
    }
  };
};

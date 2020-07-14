'use strict';
/*
 * This middleware will be used to check properties exist in the JSON
 * sent by the user. If properties doesn't exists then it will generate
 * error. Specifying which property is missing.
 *
 */
var Config = require('../../config.json');
var errorHandler = require(Config.errorHandlingFunctionsPathForMiddlewares);

module.exports = function() {
  return function dropKeyspaceKeyspaceConfigurationPropertiesPresence(req, res, next) {
    /*
     * To validate that JSON object(cassandra_node_configurations) have these properties (ip, port, keyspace_name)
     * To validate that JSON object(table_properties) have these properties ( table_name, properties, conditions)
     */
    var config = Config.cassandra_node_configuration.conf_1.split(":");
    req.body['ip'] = config[0]
    req.body['port'] = config[1]
    if ( req.params.hasOwnProperty('keyspaceName') 
      // if user doesn't provide table properties 
      // code should not stop       
    ) {
      next()
    } else {
      if (!req.params.hasOwnProperty('keyspaceName')) {
        next(errorHandler.propertyMissing("keyspaceName"))
      }
    }
  };
};

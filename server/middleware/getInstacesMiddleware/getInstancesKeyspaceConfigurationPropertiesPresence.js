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
  return function getInstancesKeyspaceConfigurationProperties(req, res, next) {
    /*
     * To validate that JSON object(cassandra_node_configurations) have these properties (ip, port, keyspace_name)
     */
    if (req.params.hasOwnProperty('keyspaceName')) {
      next()
    } else {
      if (!req.params.hasOwnProperty('keyspaceName')) {
        next((errorHandler.propertyMissing("keyspaceName")))
      }
    }
  };
};

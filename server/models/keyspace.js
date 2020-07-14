'use strict';
var cassandra = require('cassandra-driver');
var LoopBackContext = require('loopback-context');
var mysql = require('mysql')
var Config = require('../config.json');
var datasources = require('../datasources.json');
var errorHandler = require(Config.errorHandlingFunctionsPath);

module.exports = function(Keyspace) {

  /*
   * Reason to use mysql configuration here is that, it is not possible to use the datasource.JSON
   * here in this file
   */
  var con = mysql.createConnection(datasources.localDB);
  /**
   * It will return all the tables of keyspace
   * @param {Object} keyspaceName name of the keyspace
   * @param {Function(Error, )} callback
   */
  Keyspace.getInstances = function(keyspaceName, AccessToken ,cb) {
    var con = mysql.createConnection(datasources.localDB);
    con.connect(function(err) {
      /*
       * Connection error with MYSQL
       */
      if (err) {
        var error = new Error("Connection to the mysql database failed")
        error.statusCode = 400
        error.name = "Connection failed. Check your configurations and database status"
        error.status = 400;
        cb(null, error)
        /*
         * Connection with the  MYSQL database is successful
         */
      } else {
        var sql = "SELECT * from `table` where keyspaceName = (SELECT id from keyspace where keyspaceName = '" + keyspaceName + "' );";
        console.log(sql)
        con.query(sql, function(err, result) {
          /*
           * Query execution failed! Check Syntax
           */
          if (err) {
            var error = new Error("Query execution failed")
            error.statusCode = 400
            error.name = "Validate the query syntax"
            error.status = 400;
            con.end()
            cb(null, err)
                        
            /*
             * Query execution successful!
             */
          } else {
            var noOfTables = result.length

            if (noOfTables > 0) { //  if table exists
              var keyspace = {};
              var tables = []
              keyspace.tables = tables;
              for (var i = 0; i < noOfTables; i++) {
                var table = {
                  "tableName": result[i].tableName
                }
                keyspace.tables.push(table);
              }
              con.end()
              cb (null, keyspace)
            } else { // if tables doesn't exists
              var error = new Error("No table exists for this keyspace")
              error.statusCode = 404
              error.name = "No table found"
              error.status = 404;
              con.end()
              cb(null, error)
            }
          }
        });
      }
    });
  }; // Remote Method Logic END

  Keyspace.remoteMethod(
    'getInstances', {
      http: {
        path: '/:keyspaceName/tables/getInstances',
        verb: 'POST'
      },
      returns: {
        arg: 'tableNames',
        type: 'Object'
      },
      accepts: [{
          arg: "keyspaceName",
          type: 'string',
          required: true,
          description: "Name of the keyspace",
          http: {
            "source": "path"
          }

        }, {
          arg: "AccessToken",
          type: 'Object',
          required: false,
          default: {
            accessToken_id: "",
            accessToken_userId: ""
          },
          description: "Properties of cassandra table",
          http: {
            "source": "body"
          }
        
      }],
    description: "It return the table available in the keyspace"
  }
); // Remote Methode Properties END

/**
 * It will drop a table in cassandra keyspace
 * @param {object} keyspaceName cassandra keyspace name
 * @param {object} tableProperties properties of cassandra table
 * @param {Function(Error, )} callback
 */
Keyspace.drop = function(keyspaceName, tableProperties, cb) {
  /*
   * Connecting to MYSQL local database
   */
  var con = mysql.createConnection(datasources.localDB);

  con.connect(function(err) {
    /*
     * Connection error with MYSQL
     */
    if (err) {
      var error = new Error("Connection to the mysql database failed")
      error.statusCode = 400
      error.name = "Connection failed. Check your configurations and database status"
      error.status = 400;
      con.end()
      cb(null, error)
      /*
       * Connection with the  MYSQL database is successful
       */
    } else {
      var sql = "Delete from `table` where (tableName='" + tableProperties.table_name + "' AND keyspaceName = (SELECT id from keyspace where keyspaceName='" + keyspaceName + "'))";
      con.query(sql, function(err, result) {
        if (err) {
          var error = new Error("Query execution failed")
          error.statusCode = 400
          error.name = "Validate the query syntax"
          error.status = 400;
          con.end()
          cb(null, error)
        } else {
          var responce = new Error("Query executed successfully")
          responce.statusCode = 202
          responce.name = "Table dropped"
          responce.status = 202;
          con.end()
          cb(null, responce)
        }
      });
    }
  });
};

Keyspace.remoteMethod(
  'drop', {
    http: {
      path: '/:keyspaceName/tables/drop',
      verb: 'delete'
    },
    returns: {
      arg: 'result',
      type: 'Object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'Object',
        required: false,
        default: {
          table_name: ""
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will delete a table in the keyspace"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('drop', function(context, unused, next) {
  /*
   * Connecting to cassadra node
   */
  //context.args.tableProperties.table_name
  var client = new cassandra.Client({
    contactPoints: [context.args.tableProperties.ip + ":" + context.args.tableProperties.port]
  });

  client.execute(" DROP TABLE " + context.args.keyspaceName + "." + context.args.tableProperties.table_name + ";", function(err, result) {
    /*
     * Connection | Query Execution error
     */
    if (err) {
      var error = new Error("Either tables doesn't exist or keyspace name is not correct");
      error.statusCode = 500;
      error.name = "Invalid ip | port | query | table name | keyspace name";
      error.status = 500;
      next(error)
    } else { // table dropped successfully
      next()
    }
  });
});

Keyspace.afterRemote('drop', function(context, user, next) {
  next();
});

/**
 * It will add columns in cassandra table
 * @param {object} keyspaceName cassandra keyspace name
 * @param {object} tableProperties properties of cassandra table
 * @param {Function(Error, )} callback
 */
Keyspace.addColumns = function(keyspaceName, tableProperties, cb) {
  /*
   * Generating Create Query
   */
  var query = "";
  var put_ending = ""
  query += "ALTER TABLE " + tableProperties.table_name + " ADD (";
  var i = 0;
  /*
   * Generating table schema from json object
   */
  for (var table_schema_attribute in tableProperties.columns) {
    if (i == (Object.keys(tableProperties.columns).length) - 1) {
      if (((errorHandler.validateDataTypes(tableProperties.columns[table_schema_attribute])) && errorHandler.isAlphaNumeric((tableProperties.columns[table_schema_attribute]))) || (errorHandler.slugify(table_schema_attribute) == "primarykey") || (errorHandler.slugify(table_schema_attribute) == "clusteringkey")) {
        query += table_schema_attribute + " " + tableProperties.columns[table_schema_attribute] + " ";
      } else {
        query = false
        cb(null, errorHandler.invalidDataType(tableProperties.columns[table_schema_attribute]))
        break;
      }
    } else {
      if (((errorHandler.validateDataTypes(tableProperties.columns[table_schema_attribute])) && errorHandler.isAlphaNumeric((tableProperties.columns[table_schema_attribute]))) || (errorHandler.slugify(table_schema_attribute) == "primarykey") || (errorHandler.slugify(table_schema_attribute) == "clusteringkey")) {
        query += table_schema_attribute + " " + tableProperties.columns[table_schema_attribute] + ", "
      } else {
        query = false
        cb(null, errorHandler.invalidDataType(tableProperties.columns[table_schema_attribute]))
        break;
      }
    }
    i++
  }
  query += ");"
  /*
   * Connecting to cassadra node
   */
  var client = new cassandra.Client({ contactPoints: [tableProperties.ip + ":" + tableProperties.port], keyspace: keyspaceName });
  client.execute(query, function(err, result) {
    if (err) {
      var error = new Error("Query Execution failed");
      error.statusCode = 400;
      error.name = "Invalid ip | port | query | column already exists";
      error.status = 400;
      cb(null, error)
    } else {
      var response = new Error("Query executed successfully");
      response.statusCode = 201;
      response.name = "Table is altered";
      response.status = 201;
      cb(null, response)
    }
  });
};

Keyspace.remoteMethod(
  'addColumns', {
    http: {
      path: '/:keyspaceName/tables/addColumns',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'Object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'Object',
        required: false,
        default: {
          table_name: "",
          columns: {
            col1: "int",
            col2: "varchar"
          }
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will add a column in the table"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('addColumns', function(context, unused, next) {
  next()
});

Keyspace.afterRemote('addColumns', function(context, user, next) {
  next();
});



/**
 * It will add columns in cassandra table
 * @param {object} keyspaceName cassandra keyspace name
 * @param {object} tableProperties properties of cassandra table
 * @param {Function(Error, )} callback
 */
Keyspace.addProperties = function(keyspaceName, tableProperties, cb) {
  /*
   * Generating Create Query
   */
  var query = "";
  var put_ending = ""
  query += "ALTER TABLE " + tableProperties.table_name + " With ";
  var i = 0;
  /*
   * Generating table properties from json object
   */
  if (validateTableProperties(tableProperties.table_properties)) // to check whether properties have value in them or not
  {
    put_ending = true;
    i = 0
    for (var cond in tableProperties.table_properties) {

      if (validateTablePropertiesTypes(cond)) { // to check whether table properties are valid
        if (i != 0) // for attaching and in the query
        {
          query += " AND "
          query += " " + cond + " = " + tableProperties.table_properties[cond]
        } else // for not attaching and in the query
        {
          query += " " + cond + " = " + tableProperties.table_properties[cond]
        }
        i++
      } else {
        query = false;
        var response = new Error("Invalid data");
        response.statusCode = 404;
        response.name = "Invalid Cassandra table property";
        response.status = 404;
        cb(null, response);
        break;
      }
    }
    if (query != false) {
      query += ";"
    }
  }
  /*
   * Connecting to cassadra node
   */
  var config = Config.cassandra_node_configuration.conf_1.split(":");
  var client = new cassandra.Client({ contactPoints: [ config[0] + ":" + config[1] ], keyspace: keyspaceName });
  client.execute(query, function(err, result) {
    if (err) {
      var error = new Error("Query Execution failed");
      error.statusCode = 400;
      error.name = "Invalid ip | port | query | column already exists";
      error.status = 400;
      cb(null, error)
    } else {
      var response = new Error("Query executed successfully");
      response.statusCode = 201;
      response.name = "Table is altered";
      response.status = 201;
      cb(null, response)
    }
  });
};

Keyspace.remoteMethod(
  'addProperties', {
    http: {
      path: '/:keyspaceName/tables/addProperties',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'Object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'Object',
        required: false,
        default: {
          table_name: "abc",
          table_properties: {
            "bloom_filter_fp_chance": "0.1",
            "caching": "{ 'keys' : 'NONE', 'rows_per_partition' : '120' }",
            "comment": "''",
            "compaction": "{'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}",
            "compression": "{'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}",
            "crc_check_chance": "1.0",
            "dclocal_read_repair_chance": "0.1",
            "default_time_to_live": "0",
            "gc_grace_seconds": "864000",
            "max_index_interval": "2048",
            "memtable_flush_period_in_ms": "''",
            "memtable_flush_period_in_ms": "128",
            "read_repair_chance": "0.0",
            "speculative_retry": "'99 PERCENTILE'"
          }
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will add a column in the table"
  } // Remote Methode Properties END
);





/**
 * It will drop columns of cassandra table
 * @param {object} keyspaceName cassandra keyspace name
 * @param {object} tableProperties properties of cassandra table
 * @param {Function(Error, )} callback
 */

Keyspace.dropColumns = function(keyspaceName, tableProperties, cb) {
  /*
   * Generating Create Query
   */
  var query = "";
  var put_ending = ""
  query += "ALTER TABLE " + tableProperties.table_name + " DROP (";
  var i = 0;
  /*
   * Generating table schema from json object
   */
  for (var table_schema_attribute in tableProperties.properties) {
    if (i == (Object.keys(tableProperties.properties).length) - 1) {
      query += table_schema_attribute + " ";
    } else {
      query += table_schema_attribute + " ,";
    }
    i++
  }
  query += ");"
  /*
   * Connecting to cassadra node
   */
  var client = new cassandra.Client({ contactPoints: [tableProperties.ip + ":" + tableProperties.port], keyspace: keyspaceName });
  client.execute(query, function(err, result) {
    if (err) {
      var error = new Error("Query Execution failed");
      error.statusCode = 400;
      error.name = "Invalid ip | port | query";
      error.status = 400;
      cb(null, error)
    } else {
      var response = new Error("Query executed successfully");
      response.statusCode = 202;
      response.name = "Table is altered";
      response.status = 202;
      cb(null, response)
    }
  });
};

Keyspace.remoteMethod(
  'dropColumns', {
    http: {
      path: '/:keyspaceName/tables/dropColumns',
      verb: 'DELETE'
    },
    returns: {
      arg: 'result',
      type: 'Object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'Object',
        required: false,
        default: {
          table_name: "",
          properties: {
            col1: "",
            col2: ""
          }
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will drop a column in the table"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('dropColumns', function(context, unused, next) {
  next();
});

Keyspace.afterRemote('dropColumns', function(context, user, next) {
  next();
});




/**
 * It will create a table in cassandra keyspace
 * @param {object} keyspaceName cassandra keyspace name
 * @param {object} tableProperties properties of cassandra table
 * @param {Function(Error, )} callback
 */
Keyspace.Create = function(keyspaceName, tableProperties, cb) {
  /*
   * Connecting to MYSQL local database
   */
  var con = mysql.createConnection(datasources.localDB);
  con.connect(function(err) {
    var keyspace_id = 0;
    /*
     * Connection error with MYSQL
     */
    if (err) {
      var error = new Error("Connection to the mysql database failed")
      error.statusCode = 400
      error.name = "Connection failed. Check your configurations and database status"
      error.status = 400;
      con.end()
      cb(null, error)
      /*
       * Connection with MYSQL is successful
       */
    } else {

      var sql = 'INSERT INTO `table` (ip,port,keyspaceName, tableName, tableSchema, table_properties) VALUES ("' + tableProperties.ip + '" , ' + tableProperties.port + ' , (SELECT id from keyspace where keyspaceName="' + keyspaceName + '") , "' + tableProperties.table_name + '", "' + tableProperties.table_schema + '", "' + tableProperties.table__properties + '")';
      con.query(sql, function(err, result) {
        if (err) {
          var error = new Error("Query execution failed")
          error.statusCode = 400
          error.name = "Validate the query syntax"
          error.status = 400;
          con.end()
          cb(null, err)
        } else {
          var responce = new Error("Query executed successfully")
          responce.statusCode = 201
          responce.name = "Table Created"
          responce.status = 201;
          con.end()
          cb(null, responce)
        }
      });
    }
  });

};

Keyspace.remoteMethod(
  'Create', {
    http: {
      path: '/:keyspaceName/tables/Create',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'object',
        required: false,
        default: {
          table_name: "car",
          table_schema: {
            "producer": "text",
            "production_year": "int",
            "primary key": "(producer, production_year)",
          },
          table__properties: {
            "bloom_filter_fp_chance": "0.1",
            "caching": "{ 'keys' : 'NONE', 'rows_per_partition' : '120' }",
            "comment": "''",
            "compaction": "{'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}",
            "compression": "{'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}",
            "crc_check_chance": "1.0",
            "dclocal_read_repair_chance": "0.1",
            "default_time_to_live": "0",
            "gc_grace_seconds": "864000",
            "max_index_interval": "2048",
            "memtable_flush_period_in_ms": "''",
            "memtable_flush_period_in_ms": "128",
            "read_repair_chance": "0.0",
            "speculative_retry": "'99 PERCENTILE'"

          }
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will create a table in cassandra keyspace"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('Create', function(context, unused, next) {
  /*
   * Generating Create Query
   */
  var query = "";
  var put_ending = ""
  query += "CREATE TABLE IF NOT EXISTS " + context.args.tableProperties.table_name + "(";
  var i = 0;
  /*
   * Generating table schema from json object
   */
  console.log(query) 
  for (var table_schema_attribute in context.args.tableProperties.table_schema) {
    if (i == (Object.keys(context.args.tableProperties.table_schema).length) - 1) {
      if (((errorHandler.validateDataTypes(context.args.tableProperties.table_schema[table_schema_attribute])) && errorHandler.isAlphaNumeric((context.args.tableProperties.table_schema[table_schema_attribute]))) || (errorHandler.slugify(table_schema_attribute) == "primarykey") || (errorHandler.slugify(table_schema_attribute) == "clusteringkey")) {
        query += table_schema_attribute + " " + context.args.tableProperties.table_schema[table_schema_attribute] + " ";
      } else {
        query = false
        next(errorHandler.invalidDataType(context.args.tableProperties.table_schema[table_schema_attribute]))
        break;

      }
    } else {
      if (((errorHandler.validateDataTypes(context.args.tableProperties.table_schema[table_schema_attribute])) && errorHandler.isAlphaNumeric((context.args.tableProperties.table_schema[table_schema_attribute]))) || (errorHandler.slugify(table_schema_attribute) == "primarykey") || (errorHandler.slugify(table_schema_attribute) == "clusteringkey")) {
        query += table_schema_attribute + " " + context.args.tableProperties.table_schema[table_schema_attribute] + ", "
      } else {
        query = false
        next(errorHandler.invalidDataType(context.args.tableProperties.table_schema[table_schema_attribute]))
        break;

      }
    }
    i++
  }
  /*
   * Generating table properties from json object
   */
  if (validateTableProperties(context.args.tableProperties.table__properties)) // to check whether properties have value in them or not
  {
    put_ending = true;
    query += " ) WITH"
    i = 0
    for (var cond in context.args.tableProperties.table__properties) {

      if (validateTablePropertiesTypes(cond)) { // to check whether table properties are valid
        if (i != 0) // for attaching and in the query
        {
          query += " AND "
          query += " " + cond + " = " + context.args.tableProperties.table__properties[cond]
        } else // for not attaching and in the query
        {
          query += " " + cond + " = " + context.args.tableProperties.table__properties[cond]
        }
        i++
      } else {
        query = false;
        var response = new Error("Invalid data");
        response.statusCode = 404;
        response.name = "Invalid Cassandra table property";
        response.status = 404;
        cb(null, response);
        break;

      }

    }
    if (query != false) {
      query += ";"
    }
  }
  //query +=");"
  if (query != false) {
    console.log(query)
    /*
     * Connecting to cassadra node
     */
    if (put_ending != true) {
      query += ");"
    }
    var client = new cassandra.Client({ contactPoints: [ontext.args.tableProperties.ip + ":" + context.args.tableProperties.port], keyspace: context.args.keyspaceName });
    client.execute(query,
      function(err, result) {
        /*
         * Connection | Query Execution issue
         */
        if (err) {
          var error = new Error("Either tables doesn't exist or keyspace name is not correct");
          error.statusCode = 400;
          error.name = "Invalid ip | port | query";
          error.status = 400;
          next(error);
        }
        /*
         * Query Executed perfectly
         */
        else {
          next()
        }
      });
  }
});

Keyspace.afterRemoteError('Create', function(context, next) {
  next()
});

Keyspace.afterRemote('Create', function(context, unused, next) {
  next()
});



/**
 * It will return all the tables of keyspace
 * @param {Object} keyspaceName name of the keyspace
 * @param {Object} KeyspaceProperties are the properties of keyspace
 * @param {Function(Error, )} callback
 */
Keyspace.createKeyspace = function(keyspaceName, KeyspaceProperties, cb) {
  /*
   * Connecting to MYSQL local database
   */
  var con = mysql.createConnection(datasources.localDB);
  con.connect(function(err) {
    var keyspace_id = 0;
    /*
     * Connection error with MYSQL
     */

    if (err) {

      var error = new Error("Connection to the mysql database failed")
      error.statusCode = 400
      error.name = "Connection failed. Check your configurations and database status"
      error.status = 400;
      con.end()
      cb(null, err)
      /*
       * Connection with MYSQL is successful
       */
    } else {
      var config = Config.cassandra_node_configuration.conf_1.split(":");
      var sql = 'INSERT INTO keyspace (ip, port,keyspaceName, class, replicationFactor, durable_writes ) VALUES ("' + config[0] + '" , ' + config[1] + ' , "' + keyspaceName + '" ,"' + KeyspaceProperties.keyspaceProperties.class + '" , ' + KeyspaceProperties.keyspaceProperties.replication_factor + ', ' + KeyspaceProperties.keyspaceProperties.durable_writes + ')';
      console.log(sql)
      con.query(sql, function(err, result) {
        if (err) {
          var error = new Error("Query execution failed")
          error.statusCode = 400
          error.name = "Validate the query syntax"
          error.status = 400;
          con.end()
          cb(null, error)
        } else {
          var responce = new Error("Query executed successfully")
          responce.statusCode = 201
          responce.name = "Keyspace Created"
          responce.status = 201;
          con.end()
          cb(null, responce)
        }
      });
    }
  });
};

Keyspace.remoteMethod(
  'createKeyspace', {
    http: {
      path: '/:keyspaceName/createKeyspace',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "KeyspaceProperties",
        type: 'object',
        required: false,
        default: {
          keyspaceProperties: {
            "class": "SimpleStrategy",
            "replication_factor": "1",
            "durable_writes": "true"
          },
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will create a cassandra keyspace"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('createKeyspace', function(context, unused, next) {
  /*
   * Generating Cassandara Create Keyspace Query
   */
  //console.log(context);
  var query = "";
  query += "CREATE KEYSPACE " + context.args.keyspaceName + "  WITH  replication = { 'class' :'";
  query += context.args.KeyspaceProperties.keyspaceProperties.class
  query += "', 'replication_factor' :";
  query += context.args.KeyspaceProperties.keyspaceProperties.replication_factor;
  query += "} AND DURABLE_WRITES = " + context.args.KeyspaceProperties.keyspaceProperties.durable_writes + " ;";

  var client = new cassandra.Client({ contactPoints: ["localhost:9042"/*, "10.128.1.2:9042", "10.128.1.3:9042" */] });
  client.execute(query,
    function(err, result) {
      /*
       * Connection | Query Execution issue
       */
      if (err) {
        var error = new Error("Either tables doesn't exist or keyspace name is not correct");
        error.statusCode = 404;
        error.name = "Invalid ip | port | query";
        error.status = 404;
        next(err);
      }
      /*
       * Query Executed perfectly
       */
      else {
        next()
      }
    });
  //, "'replication_factor'" :  '"+ context.args.KeyspaceProperties.replication_factor +"' ) AND DURABLE_WRITES = "+  context.args.KeyspaceProperties.durable_writes +" ;";
  //CREATE KEYSPACE tutorialspoint WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 3}

});

Keyspace.afterRemoteError('CreateKeyspace', function(context, next) {
  next()
});

Keyspace.afterRemote('CreateKeyspace', function(context, unused, next) {
  next()
});


/**
 * It will return all the tables of keyspace
 * @param {Object} keyspaceName name of the keyspace
 * @param {Function(Error, )} callback
 */
Keyspace.dropKeyspace = function(keyspaceName, KeyspaceProperties ,  cb) {
  /*
   * Connecting to MYSQL local database
   */
  console.log("drop keyspace")

  var con = mysql.createConnection(datasources.localDB);
  con.connect(function(err) {
    var keyspace_id = 0;
    /*
     * Connection error with MYSQL
     */

    if (err) {

      var error = new Error("Connection to the mysql database failed")
      error.statusCode = 400
      error.name = "Connection failed. Check your configurations and database status"
      error.status = 400;
      con.end()
      cb(null, error)
      /*
       * Connection with MYSQL is successful
       */
    } else {
      var sql = 'DELETE FROM keyspace where keyspaceName = "' + keyspaceName + '" ';
      con.query(sql, function(err, result) {
        if (err) {
          var error = new Error("Query execution failed")
          error.statusCode = 400
          error.name = "Validate the query syntax"
          error.status = 400;
          con.end()
          cb(null, error)
        } else {
          var responce = new Error("Query executed successfully")
          responce.statusCode = 202
          responce.name = "keyspace Droped"
          responce.status = 202;
          con.end()
          cb(null, responce)
        }
      });
    }
  });

};

Keyspace.remoteMethod(
  'dropKeyspace', {
    http: {
      path: '/:keyspaceName/dropKeyspace',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name",
        http: {
          "source": "path"
        }
      },
      {
        arg: "KeyspaceProperties",
        type: 'object',
        required: false,
        default: {
          
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will drop a cassandra keyspace"
  } // Remote Methode Properties END
);

Keyspace.beforeRemote('dropKeyspace', function(context, unused, next) {
  /*
   * Generating Cassandara Create Keyspace Query
   */
  //console.log(context);
  var query = "";
  query += "DROP KEYSPACE " + context.args.keyspaceName + "; ";


  var client = new cassandra.Client({ contactPoints: [context.args.KeyspaceProperties.ip + ":" + context.args.KeyspaceProperties.port] });
  client.execute(query,
    function(err, result) {
      /*
       * Connection | Query Execution issue
       */
      if (err) {
        var error = new Error("Either tables doesn't exist or keyspace name is not correct");
        error.statusCode = 404;
        error.name = "Invalid ip | port | query";
        error.status = 404;
        next(err);
      }
      /*
       * Query Executed perfectly
       */
      else {
        next()
      }
    });
  //, "'replication_factor'" :  '"+ context.args.KeyspaceProperties.replication_factor +"' ) AND DURABLE_WRITES = "+  context.args.KeyspaceProperties.durable_writes +" ;";
  //CREATE KEYSPACE tutorialspoint WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 3}
});

Keyspace.afterRemoteError('', function(context, next) {
  next()
});

Keyspace.afterRemote('dropKeyspace', function(context, unused, next) {
  var con = mysql.createConnection(datasources.localDB);
  con.connect(function(err) {
    var keyspace_id = 0;
    /*
     * Connection error with MYSQL
     */

    if (err) {

      var error = new Error("Connection to the mysql database failed")
      error.statusCode = 400
      error.name = "Connection failed. Check your configurations and database status"
      error.status = 400;
      con.end()
      cb(null, error)
      /*
       * Connection with MYSQL is successful
       */
    } else {
      var sql = 'DELETE FROM keyspace where keyspaceName = "' + context.args.keyspaceName + '" ';
      con.query(sql, function(err, result) {
        if (err) {
          var error = new Error("Query execution failed")
          error.statusCode = 400
          error.name = "Validate the query syntax"
          error.status = 400;
          con.end()
          next(error)
        } else {
          var responce = new Error("Query executed successfully")
          responce.statusCode = 201
          responce.name = "Table Droped"
          responce.status = 201;
          con.end()
          next(responce)
        }
      });
    }
  });
});


/**
 * It will return all the tables of keyspace
 * @param {Object} keyspaceName name of the keyspace
 * @param {Function(Error, )} callback
 */
Keyspace.getRecords = function(keyspaceName, tableProperties, cb) {
/*
   * Generating Cassandara Create Keyspace Query
   */
  //console.log(context);
  console.log(tableProperties)
  var query = "";
  query += "SELECT * FROM " + tableProperties.tableName + " LIMIT "+ tableProperties.noOfRecords +"; ";


  var client = new cassandra.Client({ contactPoints: [tableProperties.ip+":"+tableProperties.port], keyspace: keyspaceName });
  client.execute(query,
    function(err, result) {
      /*
       * Connection | Query Execution issue
       */
      if (err) {
        var error = new Error("Either tables doesn't exist or keyspace name is not correct");
        error.statusCode = 404;
        error.name = "Invalid ip | port | query";
        error.status = 404;
        next(err);
      }
      /*
       * Query Executed perfectly
       */
      else {
        cb (null , result )
      }
    });

};

Keyspace.remoteMethod(
  'getRecords', {
    http: {
      path: '/:keyspaceName/getRecords',
      verb: 'POST'
    },
    returns: {
      arg: 'result',
      type: 'object'
    },
    accepts: [{
        arg: "keyspaceName",
        type: 'string',
        required: true,
        description: "Cassandra keyspace name", 
        http: {
          "source": "path"
        }
      },
      {
        arg: "tableProperties",
        type: 'object',
        required: false,
        default: {
          tableName:"",
          noOfRecords :""
        },
        description: "Properties of cassandra table",
        http: {
          "source": "body"
        }
      }
    ],
    description: "It will get records of a table"
  } // Remote Methode Properties END
);



/*
 * To validate cassandra data types
 */
function validateDataTypes(dataType) {
  var dataTypeList = ["ascii", "bigint", "blob", "boolean", "counter", "decimal", "double", "float",
    "frozen", "inet", "int", "list", "map", "set", "text", "timestamp", "timeuuid",
    "tuple", "uuid", "varchar", "varint"
  ];
  return (dataTypeList.indexOf(dataType) > -1) ? true : false
}
/*
 * To validate cassandra properties
 */
function validateTablePropertiesTypes(tableProperties) {
  var tablePropertiesList = ["bloom_filter_fp_chance", "caching", "comment", "compaction", "compression",
    "dclocal_read_repair_chance", "default_time_to_live", "gc_grace_seconds",
    "memtable_flush_period_in_ms", "min_index_interval", "max_index_interval",
    "read_repair_chance", "speculative_retry", "crc_check_chance"
  ];
  return (tablePropertiesList.indexOf(tableProperties) > -1) ? true : false
}

/*
 * To validate value is alpha numeric
 */
function isAlphaNumeric(value) {
  return ((/[^a-zA-Z0-9]/.test(value))) ? false : true
}

function validateTableProperties(tableNameProperties) {
  return ((Object.keys(tableNameProperties).length) > 0) ? true : false
}
};

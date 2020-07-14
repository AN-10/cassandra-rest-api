/**
 *  Error handling function for handling different issues
 */
'use strict';





var methods = {
  /*
   * It will return an object containing the property missing error messages
   */
  propertyMissing: function(propertyName) {
    var error = new Error(propertyName + " is missing in JSON object");
    error.statusCode = 400
    error.name = "Cassandra keyspace configurations issue"
    error.status = 400;
    return error
  },
  /*
   * It will return an object containing the invalid properties error messages
   */
  invalidProperty: function(property) {
    var error = new Error(property + " is invalid in JSON object");
    error.statusCode = 400
    error.name = "Invalid format"
    error.status = 400;
    return error
  },
  invalidDataType : function(dataType) {
    var error = new Error(dataType + " is invalid in JSON object");
    error.statusCode = 400
    error.name = "Invalid data"
    error.status = 400;
    return error
  },

  validateIPAddress: function(ipAddress) {
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) ? true : false
  },

  validatePort: function(port) {
    return ((port != "") && (isNumeric(port)) && (port > -1 && port <= 65535)) ? true : false
  },
  validateKeyspaceName: function(keyspaceName) {
    return (isAlphaNumeric(keyspaceName)) ? true : false
  },
  /*
   * To validate where properties object is valid by checking number of elements
   */
  validateTableProperties: function(tableNameProperties) {
    return ((Object.keys(tableNameProperties).length) > 0) ? true : false
  },
  /*
   * To validate cassandra data types
   */
  validateDataTypes: function(dataType) {
    var dataTypeList = ["ascii", "bigint", "blob", "boolean", "counter", "decimal", "double", "float",
      "frozen", "inet", "int", "list", "map", "set","date", "text", "timestamp", "timeuuid",
      "tuple", "uuid", "varchar", "varint"
    ];
    return (dataTypeList.indexOf(dataType) > -1) ? true : false
  },
  isAlphaNumeric: function(value) {
    return ((/[^a-zA-Z0-9]/.test(value))) ? false : true
  },
  /*
   * To convert string to lowercase
   */
  toLower: function(value) {
    return value.toLowerCase()
  },
  /*
   * To remove white spaces from sides
   */
  removeWhiteSpacesFromSides: function(value) {
    return value.replace(/\s+/, "")
  },
  /*
   * To remove white spaces from inside
   */
  removeWhiteSpacesFromInside: function(value) {
    return value.replace(/ /g, "")
  },
  /*
   * slugify function
   */
  slugify : function (value) {
    return removeWhiteSpacesFromSides(toLower(removeWhiteSpacesFromInside(value)))
  }
  
};
/*
 *To check a string is a number or not
 */
function isNumeric(num) {
  return !isNaN(num)
}
/*
 * To validate value is alpha numeric
 */
function isAlphaNumeric(value) {
  return ((/[^a-zA-Z0-9]/.test(value))) ? false : true
}


/*
 * To convert string to lowercase
 */
function toLower(value) {
  return value.toLowerCase()
}
/*
 * To remove white spaces from sides
 */
function removeWhiteSpacesFromSides(value) {
  return value.replace(/\s+/, "")
}
/*
 * To remove white spaces from inside
 */
function removeWhiteSpacesFromInside(value) {
  return value.replace(/ /g, "")
}


module.exports = methods;

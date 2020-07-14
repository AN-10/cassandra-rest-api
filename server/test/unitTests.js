var chakram = require('chakram')
expect = chakram.expect;

describe("chakram", function() {
  var namedDweetPost, initialDweetData, specifiedThingName;
  /*
   *
   *
   * /getInstances END POINT TESTING
   *
   *
   */
  before("chakram should return  a JSON object having tables that belong to keyspace abc", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0.1",
      port: "9042",
      keyspace_name: "abc"
    };
    response = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });

  it("should return 200 on success", function() {
    console.log("")
    return expect(response).to.have.status(200);
  });


  var tableNames = {
    "tables": [{
        "tableName": "caplolir"
      },
      {
        "tableName": "caplolssir"
      },
      {
        "tableName": "caplssolssir"
      },
      {
        "tableName": "car"
      },
      {
        "tableName": "card"
      },
      {
        "tableName": "cards"
      },
      {
        "tableName": "carr"
      },
      {
        "tableName": "carrpl"
      },
      {
        "tableName": "cars"
      },
      {
        "tableName": "carsss"
      },
      {
        "tableName": "d"
      },
      {
        "tableName": "db1"
      },
      {
        "tableName": "db2"
      },
      {
        "tableName": "e"
      },
      {
        "tableName": "employee"
      },
      {
        "tableName": "f"
      },
      {
        "tableName": "g"
      },
      {
        "tableName": "h"
      },
      {
        "tableName": "i"
      },
      {
        "tableName": "irtiza"
      },
      {
        "tableName": "irtizaa"
      },
      {
        "tableName": "j"
      },
      {
        "tableName": "macro"
      },
      {
        "tableName": "micro"
      },
      {
        "tableName": "strongloop"
      },
      {
        "tableName": "strongloop1"
      },
      {
        "tableName": "stronglosop1"
      },
      {
        "tableName": "testing"
      },
      {
        "tableName": "testmodel"
      }
    ]
  }
  it("should return JSON object having tables that belong to keyspace abc", function() {
    return expect(response).to.have.json('tableNames', tableNames);
  });

  /*
   *
   *
   * /getInstances END POINT TESTING
   * MISSING SPECIFICATIONS TESTING
   *
   */

  /*
   * /getInstances
   * ip property missing
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      // ip missing
      port: "9042",
      keyspace_name: "abc"
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });


  /*
   * /getInstances
   * port property missing
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0.1",
      // port Missing
      keyspace_name: "abc"
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });

  /*
   * /getInstances
   * keyspace property missing
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0.1",
      port: "9042",
      // keyspace Missing
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });




  /*
   *
   *
   * /getInstances END POINT TESTING
   * INVALID SPECIFICATIONS TESTING
   *
   */

  /*
   * /getInstances
   * Invalid ip error
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0",
      port: "9042",
      keyspace_name: "abc"
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });

  /*
   * /getInstances
   * Invalid port specification error
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0.1",
      port: "9042a",
      keyspace_name: "abc"
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });



  /*
   * /getInstances
   * Invalid keyspace_name specification error
   */
  before("chakram should return a JSON object representing that ip property is missing ", function() {
    specifiedThingName = 'chakram-test-thing';
    keyspaceName = "abc"
    cassandraNodeConfigurations = {
      ip: "127.0.0.1",
      port: "9042a",
      keyspace_name: ""
    };
    response_1 = chakram.post("http://0.0.0.0:3000/api/keyspaces/" + keyspaceName + "/tables/getInstances", cassandraNodeConfigurations);
  });
  it("should return 400 on success", function() {
    console.log("")
    return expect(response_1).to.have.status(400);
  });










  /* var result = {
     "error code": "400",
     "response": "Error property missing",
     "info": "Represent missing property error",
     "message": "Include ip property in JSON object"
   }
   it("should respond with the created dweet's data", function() {
     return expect(response).to.have.json('result', result);
   });*/







  /*
   * Helper functions
   */

  /*
   * It will return an object containing the invalid properties error messages
   */
  function invalidProperty(property) {
    var result = {
      "error code": "400",
      "response": "Error can't use " + property + "",
      "info": "Represents invalid " + property + "",
      "message": "Enter valid " + property + ""
    }
    return result
  }
  // Create Table
  /*before("Initialize a new dweet thing for the tests", function () {
	        specifiedThingName = 'chakram-test-thing';
	        initialDweetData = {
					ip:"127.0.0.1",
					port:"9042",
					keyspace_name:"abc",
					table_name:"a",
					properties:{
					      a:"int",
					       b:"text"
					},
					conditions: {
					 "PRIMARY KEY":{
					  a:"a",
					  b:"b"
					}
				}
			}


	        response = chakram.post("http://localhost:3000/api/tables/Create", initialDweetData);
	    });
	    
	    it("should return 200 on success", function () {
	        console.log("asdasdasd")
	        return expect(response).to.have.status(200);
	    });


	    var result = {
			"response code"	: 200,
			"response"		:"Query executed successfully",
			"info"	  		:"Represents when table is created successfully",
			"message" 		:"Process completed"
		}

	    it("should respond with the created dweet's data", function () {
        return expect(response).to.have.json('result', result);
		});*/
});

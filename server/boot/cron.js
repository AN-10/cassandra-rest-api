var cron = require('node-cron');
var dsConfig = require('../datasources.json');
var Config = require('../config.json');
var cassandra = require('cassandra-driver');


cron.schedule('*/5 * * * * *', function() {
  //console.log('running a task every minute');
  var client = new cassandra.Client({ contactPoints: ["127.0.0.1" + ":" + "9042"], keyspace: "abc" });
  client.execute("SELECT * FROM system_schema.keyspaces;", function(err, result) {
    if (err) {

      //console.log("Connection failed")
    } else {


      //console.log(dsConfig.localDB)
    }
  });
});

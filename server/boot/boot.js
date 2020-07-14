module.exports = function(app) {
  var mysqlDs = app.dataSources.localDB;
  var keyspace = app.models.keyspace;
  var tables = app.models.table;
  var user = app.models.user;
  var User = app.models.User;
  var AccessToken = app.models.AccessToken;
  var ACL = app.models.ACL;


  // first autoupdate the `Author` model to avoid foreign key constraint failure
  mysqlDs.autoupdate('keyspace', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `keyspace`.');
  });
  mysqlDs.autoupdate('table', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `table`.');
    // at this point the database table `Book` should have one foreign key `authorId` integrated
  });
  mysqlDs.autoupdate('user', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `user`.');
    // at this point the database table `Book` should have one foreign key `authorId` integrated
  });
  mysqlDs.autoupdate('User', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `User`.');
    // at this point the database table `Book` should have one foreign key `authorId` integrated
  });
  mysqlDs.autoupdate('ACL', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `ACL`.');
    // at this point the database table `Book` should have one foreign key `authorId` integrated
  });
  mysqlDs.autoupdate('AccessToken', function(err) {
    if (err) throw err;
    console.log('\nAutoupdated table `AccessToken`.');
    // at this point the database table `Book` should have one foreign key `authorId` integrated
  });

 



};

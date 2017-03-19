var async = require('async');

// Require the driver.
var pg = require('pg');

// Connect to the "bank" database.
var config = {
  user: 'graffiti',
  host: 'localhost',
  database: 'graffiti',
  port: 26257
};

pg.connect(config, function (err, client, done) {
  // Closes communication with the database and exits.
  var finish = function () {
    done();
    process.exit();
  };

	console.log("TEST");

  if (err) {
    console.error('could not connect to cockroachdb', err);
    finish();
  }

  async.waterfall([
    function (next) {
      // Create the "accounts" table.
      client.query("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT);", next);
    },
    function (next) {
      // Insert two rows into the "accounts" table.
      client.query("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);", next);
    },
    function (results, next) {
      // Print out the balances.
      client.query('SELECT id, balance FROM accounts;', next);
    },
  ],
  function (err, results) {
    if (err) {
      console.error('error inserting into and selecting from accounts', err);
      finish();
    }

    console.log('Initial balances:');
    results.rows.forEach(function (row) {
      console.log(row);
    });

    finish();
  });
});

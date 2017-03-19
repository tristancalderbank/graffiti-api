const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const validator = require('./valid');

const pg = require('pg');
const config = {
  user: 'graffiti',
  host: 'localhost',
  database: 'graffiti',
  port: 26257
};

var Twitter = require('twitter');
var TwitterClient = new Twitter({
  consumer_key: process.env.APIKey,
  consumer_secret: process.env.APISecret,
  access_token_key: process.env.AccessToken,
  access_token_secret: process.env.AccessTokenSecret
});

pg.connect(config, function (err, client, done) {

	if (err) {
		console.error('could not connect to cockroachdb', err);
		done();
		process.exit();
		finish();
	}

	app.use(bodyParser.json());

	// GET content
	app.get('/content', (req, res) => {


		console.log("GET /content");

		console.log(req.query);

		let lat = parseInt(req.query.lat);
		let long = parseInt(req.query.long);

		
		async.waterfall([
			function (next) {
				client.query(`SELECT * FROM text WHERE lat=${lat} AND long=${long};`, next);
			}, 
			function (results) {
				var params = {
					q: 'local event',
					//geocode: ,
					count: 2
				};

				// Twitter API Request 
				TwitterClient.get('search/tweets', params)
				.then(function(tweets) {
					for (tweet in tweets)
						results.push({
							userName: tweet.user,
							messageText: tweet.text
						});
					console.log(tweets);
				}).catch(function(error) {
					console.error(error);
				});
			}
		],
		function (err, results) {
			if (err) {
				res.status(500).send("ERROR getting from DB");
				console.error('Error inserting into text DB', err);
			}
			
			else if (results && results.rows) {
				res.status(200).send(JSON.stringify(results.rows));
				console.log(results.rows);
			}	
			
			else {
				res.status(400).send("Could not find anything matching that in the database");
			}

	});


	// POST content
	app.post('/content', (req, res) => {

		console.log("POST /content");
		bodyErrors = validator.validContent(req.body);

		if (bodyErrors) {
			console.log("Failed validation:");
			console.log(bodyErrors);
			res.status(400).send(bodyErrors);
		}

		else {


			console.log("Body:");
			console.log(req.body);

			const contentType = req.body.type;
			const content = req.body.content;
			const lat = req.body.location.lat;
			const long = req.body.location.long;
			const userName = req.body.userName;

			
			async.waterfall([
				function (next) {
					client.query("INSERT INTO text (userName, content, lat, long) VALUES ($1::text, $2::text, $3::int, $4::int);", [userName, content, lat, long], next);
				}
			],
			function (err, results) {
				if (err) {
					res.status(500).send("ERROR inserting into DB");
					console.error('Error inserting into text DB', err);
				}
				
				console.log(results);
				res.status(200).send(req.body);
			});
			
		}

	});


	});



	app.listen(8081, () => {
		console.log('Example app running...');

	});

  });






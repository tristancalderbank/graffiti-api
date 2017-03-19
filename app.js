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
var client = new Twitter({
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


		console.log(req.query);

		let lat = parseFloat(req.query.lat);
		let long = parseFloat(req.query.long);

		console.log(lat, long);

		res.send('Recieved GET');

		var params = {
			//geocode: ,
			count: 10
		};

		// Twitter API Request 
		client.get('search/tweets', params)
		.then(function(tweets) {
			console.log(tweets);
		}).catch(function(error) {
			console.error(error);
		});

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

		console.log("Body:");
		console.log(req.body);

		const contentType = req.body.type;
		const content = req.body.content;
		const lat = req.body.location.lat;
		const long = req.body.location.long;

		
		async.waterfall([
			function (next) {
				client.query(`INSERT INTO text (content, lat, long) VALUES ('${content}', ${lat}, ${long});`, next);
			}
		],
		function (err, results) {
			if (err) {
				console.error('Error inserting into text DB', err);
			}
			
			console.log(results);
			res.status(200).send(req.body);
		});
		

	});



	app.listen(8081, () => {
		console.log('Example app running...');

	});

  });






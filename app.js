var express = require('express');
var app = express();
var streamingS3 = require('streaming-s3'),
    fs = require('fs');

var fwk = require('fwk');
var assert = require('assert');

var cfg = fwk.populateConfig(require("./utils/config.js").config);

var ddb = require('./lib/ddb').ddb({accessKeyId: cfg['DYNAMODB_ACCESSKEYID'], 
                                     secretAccessKey: cfg['DYNAMODB_SECRETACCESSKEY']});


app.get('/', function (req, res) {
	res.send('Use /publish to publish RPi video');
    });

app.get('/publish', function (req, res) {
	res.send('request to publish video url : '+req.query.vidurl);

	//this will be the metadata associated with the video - name, publish time, data source, user

	var randomName = randomString(10);
	console.log(randomName);

	var item = { start: (new Date).getTime(),
		     sha: randomName,
		     camera:cfg['CAMERA_NAME'],
		     usr: 'spolu'};

	// store the video, which is named the same as the random string generated for the metadata entry 
	//	var fStream = fs.createReadStream(__dirname + '/videoviewdemo.mp4');
	var fStream = fs.createReadStream(__dirname + '/'+req.query.vidurl);
	var s3key = randomName+'.mp4';
	var uploader = new streamingS3(fStream, {accessKeyId: 'AKIAI4OGNRY4NBZPP6TA', 
						 secretAccessKey: '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'},
	    {
		Bucket: 'ec424',
		Key: s3key,
		ContentType: 'video/mp4'
	    },
	    function (err,resp,stats) {
		if (err) return console.log('Upload error: ', e);
		console.log('Upload stats: ', stats);
		console.log('Upload successful: ', resp);
		ddb.putItem(cfg['DYNAMODB_TEST_TABLE1'], item, {}, function(err, res, cap) {
			console.log("in ddb.putItem");
			if(err)
			    console.log(err);
			assert.equal(err, null, 'putItem error occured');    
		    });
	    }
	    );
    });

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
    });


var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// cfg

  

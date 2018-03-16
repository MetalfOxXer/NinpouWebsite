'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var auth = require('./config/auth');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth.initialize());

var mongooseConnection = process.env.DATABASE_URL || 'mongodb://localhost/narutoninpou';
mongoose.connect(mongooseConnection);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', function() {
	console.log('Connected to Mongo.');
});

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/threads', require('./routes/threads'));
app.use('/sections', require('./routes/sections'));
app.use('/forum', require('./routes/forum'));
app.use('/alias', require('./routes/alias'));
app.use('/games', require('./routes/games'));
app.use('/stats', require('./routes/stats'));
app.use('/streams', require('./routes/streams')); 
app.use('/missions', require('./routes/missions')); 

app.get('/latest', function(req, res) {
	res.redirect('https://drive.google.com/file/d/1mjTmNEAaG8wKK8NxGjW7QDAJIy65ONZc/view?usp=sharing');
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening on port ' + port + '...');
});


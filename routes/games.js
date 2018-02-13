'use strict';

var mongoose = require('mongoose');
var express = require('express');
var https = require('https');
var router = express.Router();

function parseGameInfoData(data) {
	var gamename = data.split('<b>Gamename</b>: ')[1].split('\t<br />')[0];
	var gameSlots = [];
	var slots = data.split('<tr>');
	for (var i = 2; i < slots.length; i++) {
		if (slots[i].indexOf('<td colspan="3" class="slot">') != -1) {
			gameSlots.push({ 'username': null, 'realm': null, 'ping': null });
		} else {
			var username = slots[i].split('<td class="slot">')[1].split('</td>')[0];
			var realm = slots[i].split('<td class="slot">')[2].split('</td>')[0];
			var ping = slots[i].split('<td class="slot">')[3].split('</td>')[0];
			gameSlots.push({ 'username': username, 'realm': realm, 'ping': ping });
		}
	}
	return {
		'gamename': gamename,
		'slots': gameSlots
	};
}

function getGameInfo(id, players, slots, callback) {
	https.get('https://entgaming.net/forum/slots_fast.php?id=' + id, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			if (data.split('<b>Map</b>: ').length > 1) {
				var map = data.split('<b>Map</b>: ')[1].split('</h2>')[0];
				if (map.toLowerCase().indexOf('ninpou') != -1) {
					var info = parseGameInfoData(data);
					info['map'] = map;
					info['players'] = players;
					return callback(null, info);
				}
			}
			return callback(null, null);
		});
	}).on('error', function(err) {
		callback(err);
	});
}

router.get('/', function(req, res) {
	var games = [];
	var count = 0; 
	https.get('https://entgaming.net/forum/games_fast.php', function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			var games = data.split('\n');
			var count = games.length;
			for (var i = 0; i < games.length; i++) {
				if (games[i] && games[i].split('|').length > 4) {
					var id = games[i].split('|')[0];
					var players = games[i].split('|')[2];
					var slots = games[i].split('|')[3];
					getGameInfo(id, players, slots, function(err, game) {
						if (err) return res.status(500).end();
						if (game != null) {
							games.push(game);
						}
						++count; 
						if (count == games.length) {
							return res.json(games);
						}
					});
				}
			}
		});
	}).on('error', function(err) {
		return res.status(500).end();
	});
});

module.exports = router;
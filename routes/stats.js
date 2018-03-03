'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var HeroStat = require('../models/HeroStat');

var encodedPlayersId = [];
encodedPlayersId[0] = 6;
encodedPlayersId[1] = 10;
encodedPlayersId[2] = 0;
encodedPlayersId[3] = 9;
encodedPlayersId[4] = 5;
encodedPlayersId[5] = 4;
encodedPlayersId[6] = 2;
encodedPlayersId[7] = 1;
encodedPlayersId[8] = 8;

var encodedInts = [];
encodedInts[5] = "0";
encodedInts[84] = "1";
encodedInts[21] = "2";
encodedInts[78] = "3";
encodedInts[44] = "4";
encodedInts[45] = "5";
encodedInts[76] = "6";
encodedInts[41] = "7";
encodedInts[25] = "8";
encodedInts[67] = "9";
encodedInts[39] = "a";
encodedInts[23] = "b";
encodedInts[85] = "c";
encodedInts[74] = "d";
encodedInts[11] = "e";
encodedInts[30] = "f";
encodedInts[24] = "g";
encodedInts[66] = "h";
encodedInts[42] = "i";
encodedInts[0] = "j";
encodedInts[77] = "k";
encodedInts[59] = "l";
encodedInts[49] = "m";
encodedInts[9] = "n";
encodedInts[79] = "o";
encodedInts[61] = "p";
encodedInts[69] = "q";
encodedInts[83] = "r";
encodedInts[8] = "s";
encodedInts[27] = "t";
encodedInts[16] = "u";
encodedInts[75] = "v";
encodedInts[70] = "w";
encodedInts[18] = "x";
encodedInts[62] = "y";
encodedInts[65] = "z";
encodedInts[7] = "A";
encodedInts[82] = "B";
encodedInts[19] = "C";
encodedInts[52] = "D";
encodedInts[38] = "E";
encodedInts[56] = "F";
encodedInts[6] = "G";
encodedInts[28] = "H";
encodedInts[58] = "I";
encodedInts[57] = "J";
encodedInts[17] = "K";
encodedInts[29] = "L";
encodedInts[68] = "M";
encodedInts[34] = "N";
encodedInts[54] = "O";
encodedInts[26] = "P";
encodedInts[81] = "Q";
encodedInts[2] = "R";
encodedInts[12] = "S";
encodedInts[50] = "T";
encodedInts[89] = "U";
encodedInts[71] = "V";
encodedInts[15] = "W";
encodedInts[47] = "X";
encodedInts[22] = "Y";
encodedInts[35] = "Z";
encodedInts[20] = ">";
encodedInts[32] = "|";
encodedInts[10] = ";";
encodedInts[87] = "/";
encodedInts[46] = "[";
encodedInts[64] = "]";
encodedInts[1] = "+";
encodedInts[53] = "'";
encodedInts[43] = "-";
encodedInts[60] = "*";
encodedInts[13] = "/";
encodedInts[37] = "<";
encodedInts[3] = ",";
encodedInts[80] = ":";
encodedInts[72] = "?";
encodedInts[33] = "{";
encodedInts[63] = "}";
encodedInts[55] = "!";
encodedInts[36] = "\"";
encodedInts[14] = "@";
encodedInts[40] = "#";
encodedInts[86] = "$";
encodedInts[51] = "%";
encodedInts[73] = "(";
encodedInts[31] = ")";
encodedInts[4] = ".";
encodedInts[88] = "=";
encodedInts[48] = "\\";

function decodeInt(res, string) {
	for (var i = 0; i < 90; i++) {
		if (encodedInts[i] == string) {
			return i;
		}
	}
	return res.status(400).json({ error: 'Invalid code.' });
};

function decodePlayerId(res, id) {
	if (id < 0 || id > 8) {
		return res.status(400).json({ error: 'Invalid code.' });
	}
	return encodedPlayersId[id];
};

function getSlotId(playerId) {
	if (playerId < 3) return playerId;
	else if (playerId > 3 && playerId < 7) return playerId - 1;
	else return playerId - 2;
};

router.post('/:game_id', function(req, res) {
	Game.findById(req.params.game_id, function(err, game) {
		if (err) return res.status(500).json({ error: 'Game not found.' });
		if (game.recorded) return res.status(400).json({ error: 'Game was already recorded.' });
		if (game.slots.length != 9) return res.status(400).json({ error: 'Invalid game.' });
		var body = req.body.contents;
		if (body.length < 11) return res.status(400).json({ error: 'Invalid code.' });
		var count = decodeInt(res, body[0]);
		var winningTeam = decodeInt(res, body[1]);
		var playerIndex = 0;
		var sum = 0;
		for (var i = 2; i < body.length; i++) {
			var state = body[i];
			var player_id = decodePlayerId(res, playerIndex);
			var id = getSlotId(player_id);
			if (state == '0') {
				if (game.slots[id].username) {
					return res.status(400).json({ error: 'Invalid code.' });
				}
				game.slots[id].state = 'EMPTY';
			} else if (state == '1' || state == '2') { 
				if (!game.slots[id].username) {
					return res.status(400).json({ error: 'Invalid code.' });
				}
				var hero = decodeInt(res, body[++i]);
				var kills = decodeInt(res, body[++i]);
				var deaths = decodeInt(res, body[++i]);
				var assists = decodeInt(res, body[++i]);
				var gpm = decodeInt(res, body[++i]);
				game.slots[id].hero = hero;
				game.slots[id].kills = kills;
				game.slots[id].deaths = deaths;
				game.slots[id].assists = assists;
				game.slots[id].gpm = gpm;
				game.slots[id].win = (winningTeam == 3 && (player_id == 0 || player_id == 1 || player_id == 2)) || (winningTeam == 7 && (player_id == 4 || player_id == 5 || player_id == 6)) || (winningTeam == 11 && (player_id == 8 || player_id == 9 || player_id == 10));
				if (state == '1') {
					game.slots[id].state = 'PLAYING';
				} else {
					game.slots[id].state = 'LEFT';
				}
				sum += gpm / 10;
			} else {
				return res.status(400).json({ error: 'Invalid code.' });
			}
			++playerIndex;
		}
		if (sum + 1 != count) return res.status(400).json({ error: 'Invalid code.' });
		game.recorded = true;
		game.save(function(err) {
			if (err) return res.status(500).json(err);
			(function addStat(index) {
				if (index >= game.slots.length) {
					return res.status(200).send();
				} else if (!game.slots[index].username) {
					addStat(index + 1);
				} else {
					Stat.update({ username: game.slots[index].username.toLowerCase(), map: game.map }, {
						username: game.slots[index].username.toLowerCase(),
						map: game.map,
						$inc: { kills: game.slots[index].kills, deaths: game.slots[index].deaths, assists: game.slots[index].assists, gpm: game.slots[index].gpm, wins: game.slots[index].win ? 1 : 0, games: 1 }
					}, { upsert: true, setDefaultsOnInsert: true }, function(err) {
						if (err) res.status(500).json(err);
						HeroStat.update({ hero: game.slots[index].hero, map: game.map }, {
							hero: game.slots[index].hero,
							map: game.map,
							$inc: { kills: game.slots[index].kills, deaths: game.slots[index].deaths, assists: game.slots[index].assists, gpm: game.slots[index].gpm, wins: game.slots[index].win ? 1 : 0, games: 1 }
						}, { upsert: true, setDefaultsOnInsert: true }, function(err) {
							if (err) res.status(500).json(err);
							addStat(index + 1);
						});
					});
				}
			})(0);
		});
	});
});

router.get('/games', function(req, res) {
	Game.find({ recorded: false }).sort({ _id: -1 }).limit(10).exec(function(err, games) {
		if (err) return res.status(500).json(err);
		return res.status(200).json(games);
	});
});

module.exports = router;
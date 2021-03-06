'use strict';

var http = require('http');

function isOwner(game, slot) {
	return game.slots[slot].username != null && game.slots[slot].username.toLowerCase() == game.owner.toLowerCase();
}

module.exports = function(bot, game) {
	(function next(i) {
		if (i < game.slots.length) {
			var alias = game.slots[i].alias;
			if (alias && !isOwner(game, i)) {
				http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + alias, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function() { 
						if (res.statusCode == 200) { 
							try { 
								var data = JSON.parse(body); 
								if (data.subscribe) {
									bot.guilds.forEach(function(guild) {
										guild.members.forEach(function(member) {
											if (member.id == alias) {
												member.sendMessage('Game ' + game.gamename + ' has started!\n\nType !subscribe to disable these messages.');
											}
										});
									});
								}
							} catch (e) {
								console.error(e);
							}
						}
					});
				});
			}
			next(i + 1);
		}
	})(0);
};
 
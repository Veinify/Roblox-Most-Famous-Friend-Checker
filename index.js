const request = require('node-superfetch');
const request2 = require('async-request');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const AsciiTable = require('ascii-table');
const moment = require('moment')
const cheerio = require('cheerio')
const { asyncSort, ObjectLength, avgCompleteTime, completeTime } = require('./util')
var colors = {
	RESET: '\033[39m',
	BLACK: '\033[90m',
	RED: '\033[91m',
	GREEN: '\033[92m',
	YELLOW: '\033[93m',
	BLUE: '\033[94m',
	MAGENTA: '\033[95m',
	CYAN: '\033[96m',
	WHITE: '\033[97m',
	UI1: '\033[37m',
	UI2: '\033[90m'
};
const title = fs.readFileSync('./title.txt', 'utf8');

/*---------------*/

let user;

/*---------------*/

async function init() {
	await console.log(
		`${colors.RED}${title.toString()}\n${colors.UI2}Made by: ${
			colors.CYAN
		}Veinify#1210\n${colors.UI1}Found a bug? Please send me a dm on my discord!`
	);
	await console.log(`${colors.GREEN}loaded!${colors.RESET}`);
	await console.log('...');
	await rl.question(
		`${colors.YELLOW}Enter your user id.\n${colors.RESET}> ${
			colors.GREEN
		}`,
		async id => {
			user = id;
			start();
				}
			);
}

async function start() {
	let result = [];
	let total = 0;
	const username = await getUsername(user);
	let currentDate = Date.now()
	let userfriends = (await getFriends(user)).data
	let friendsize = ObjectLength(userfriends)
	console.log(`${colors.YELLOW}Checking ${colors.RED}${username} ${colors.YELLOW}most famous friend... (Estimated time: ${avgCompleteTime(friendsize)} seconds)`)
	if (friendsize <= 0) {
	    console.log(`${colors.WHITE}${username} ${colors.UI1}doesn't have any friend!`);
	    process.exit();
	}
	userfriends = (await asyncSort(userfriends , async function(a, b) {
		a = await getUserFollowCount(a.id)
		b = await getUserFollowCount(b.id)
		return b - a;
    })).map(function(name) {
		return name.name;
	});
	const table = new AsciiTable(`${username}'s Most Famous Friends`)
	  .setHeading('No.', 'Username', 'Follower', 'Place Visit')
	for (const user of userfriends) {
	    const id = await getUserId(user);
	    const followcount = await getUserFollowCount(id);
	    const placevisit = await getUserPlaceVisits(id);
	    const isbanned = await isBanned(id);
	    result++
	    table.addRow(result, isbanned ? `${user} [BANNED]` : user, followcount, placevisit)
	};
	console.log(`${colors.RESET}${table}`)
	fs.writeFileSync('./result.txt', table.toString())
	console.log(`${colors.WHITE}The result has been writen in ${colors.YELLOW}result.txt ${colors.WHITE}file.`)
	var data = {
	    time: completeTime(Date.now(), currentDate),
	    userSize: friendsize
	}
	fs.writeFileSync('./data.txt', JSON.stringify(data))
	console.log(`${colors.BLUE}Completed in ${colors.CYAN}${completeTime(Date.now(), currentDate)}${colors.BLUE} second(s).${colors.RESET}`)
	process.exit();
}
async function getFriends(id) {
	try {
		const { body } = await request.get(
			`https://friends.roblox.com/v1/users/${id}/friends`
		);
		return body;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}
async function getUsername(id) {
	try {
		const { body } = await request.get(`https://api.roblox.com/users/${id}`);
		return body.Username;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}

async function getUserId(name) {
	try {
		const { body } = await request.get(`https://api.roblox.com/users/get-by-username?username=${name}`);
		return body.Id;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid usermame. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}

async function getUserFollowCount(id) {
	try {
		const { body } = await request.get(`https://friends.roblox.com/v1/users/${id}/followers/count`);
		return body.count;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}

async function isBanned(id) {
	try {
		const { body } = await request.get(`https://users.roblox.com/v1/users/${id}`);
		return body.isBanned;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}

async function getUserPlaceVisits(id) {
	try {
		const { body } = await request2(`https://www.roblox.com/users/${id}/profile`);
		const $ = cheerio.load(body);
		const count = 
		$('.profile-stat .text-lead').toString().replace(/<p class="text-lead">(.*?)<\/p>/, '').replace(/<p class="text-lead">/, '').replace(/<\/p>/, ''); // An idiot way to do this
		return count;
	} catch (e) {
		if (e.message.toLowerCase() === '404 notfound') {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
			return;
		} else if (
			e.message.toLowerCase() === '400 bad request' ||
			e.message.toLowerCase() === '400 badrequest'
		) {
			console.log(`${colors.RED}The user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			//process.exit();
			return;
		}
	}
}
init();
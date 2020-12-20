const request = require('node-superfetch');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const AsciiTable = require('ascii-table');
const moment = require('moment')

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

let Person1;
let Person2;

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
		`${colors.YELLOW}Please enter the 1st user's id.\n${colors.RESET}> ${
			colors.GREEN
		}`,
		async id => {
			Person1 = id;
			await rl.question(
				`${colors.YELLOW}Please enter the 2nd user's id.\n${colors.RESET}> ${
					colors.GREEN
				}`,
				id => {
					if (id === Person1) {
						console.log(`${colors.RED}You cannot use the same id!`);
						process.exit();
						return;
					}
					Person2 = id;
					start();
				}
			);
		}
	);
}

async function start() {
	let result = [];
	let total = 0;
	const Person1name = await getUsername(Person1);
	const Person2name = await getUsername(Person2);
	console.log(
		`${colors.YELLOW}${Person1name} ${colors.GREEN}⇄  ${
			colors.YELLOW
		}${Person2name}\n${colors.CYAN}Checking mutual friends...`
	);
	let currentDate = Date.now()
	let Person1friends = (await getFriends(Person1)).data.sort(function(a, b) {
		return a.name.localeCompare(b.name);
	}).map(function(name) {
		return name.name;
	});
	let Person2friends = (await getFriends(Person2)).data.map(function(name) {
		return name.name;
	});
	const combined = Person1friends.concat(Person2friends.filter((name) => Person1friends.indexOf(name) < 0));
	const table = new AsciiTable('Mutual Friends Result')
	  .setHeading('No.', 'Username', 'Account Date')
	for (const user of Person1friends) {
		if (Person2friends.includes(user)) {
	let id = await getUserId(`${user}`)
	let date = moment(new Date(await getUserDate(id))).format('MM/DD/YYYY');
			total++;
			result.push(`${colors.YELLOW}${total}${colors.WHITE}. ${user}`);
			table.addRow(total, user, date)
		}
	};

    if (result.length > 0) {
		console.log(
			`${colors.GREEN}Out of ${combined.length} (${Person1friends.length +
				Person2friends.length} total) users. ${total} mutual users found!\n${result.join(
				'\n'
			)}`
		);
	fs.writeFileSync('./result.txt', table.toString())
	console.log(`${colors.WHITE}The result has been writen in ${colors.YELLOW}result.txt ${colors.WHITE}file.`)
	} else {
		console.log(
			`${colors.RED}Out of ${Person1friends.length +
				Person2friends.length} users. No mutual friends found.`
		);
	}
	console.log(`${colors.BLUE}Completed in ${colors.CYAN}${((Date.now() - currentDate) / 1000)}${colors.BLUE} second(s).${colors.RESET}`)
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
			console.log(`${colors.RED}One of the user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			process.exit();
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
			console.log(`${colors.RED}One of the user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			process.exit();
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
			console.log(`${colors.RED}One of the user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			process.exit();
			return;
		}
	}
}

async function getUserDate(id) {
	try {
		const { body } = await request.get(`https://users.roblox.com/v1/users/${id}`);
		return body.created;
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
			console.log(`${colors.RED}One of the user is either banned or invalid.`);
			process.exit();
			return;
		} else {
			console.log(e);
			process.exit();
			return;
		}
	}
}
init();

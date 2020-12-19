const request = require('node-superfetch');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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
	let Person1friends = await getFriends(Person1);
	Person1friends = Person1friends.data.map(function(name) {
		return name.name;
	});
	let Person2friends = await getFriends(Person2);
	Person2friends = Person2friends.data.map(function(name) {
		return name.name;
	});
	await Person1friends.forEach(function(user) {
		if (Person2friends.includes(user)) {
			total++;
			result.push(`${colors.YELLOW}${total}${colors.WHITE}. ${user}`);
		}
	});

	if (result.length > 0) {
		console.log(
			`${colors.GREEN}Out of ${Person1friends.length +
				Person2friends.length} users. ${total} mutual users found!\n ${result.join(
				'\n'
			)}`
		);
	} else {
		console.log(
			`${colors.RED}Out of ${Person1friends.length +
				Person2friends.length} users. No mutual friends found.`
		);
	}
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
			return
		} else if (e.message.toLowerCase() === '400 bad request' || e.message.toLowerCase() === '400 badrequest') {
		    console.log(`${colors.RED}One of the user is either banned or invalid.`)
		    process.exit();
		    return
		} else {
			console.log(e);
			process.exit();
			return
		}
	}
}
async function getUsername(id) {
	try {
		const { body } = await request.get(`https://api.roblox.com/users/${id}`);
		return body.Username;
	} catch (e) {
		if (e.message.toLowerCase() !== '404 notfound') {
			console.log(e);
		} else {
			console.log(
				`${colors.RED}You have provided an invalid user-id. Please try again.`
			);
			process.exit();
		}
	}
}
init();

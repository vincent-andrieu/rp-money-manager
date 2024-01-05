import 'dotenv/config';
import 'module-alias/register.js';

import * as readline from 'readline';
import { parseCommand } from "./commands";
import initDatabase from "./database";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

function askQuestion(): Promise<string> {
    return new Promise((resolve) => {
        rl.question('Command: ', (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    await initDatabase();

    console.log();
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await parseCommand(await askQuestion());
        console.log();
    }

    rl.close();
}

main();
import {readFileSync} from "fs";
import {writeFileSync} from "node:fs";

const data = readFileSync(__dirname + '/Oxford English Dictionary.txt').toString('utf-8');

const words: string[] = [];
const re = /^([A-z]+) {2}\b/mg;
let m;

do {
    m = re.exec(data);
    if (m) {
        words.push(m[1].toLowerCase());
    }
} while (m);

writeFileSync(__dirname + '/oxford_words.txt', words.join('\n'), 'utf-8');
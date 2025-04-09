import {readFileSync} from "fs";


const data = readFileSync('./data/oxford_words.txt').toString('utf-8').split('\n');


function randomWord() {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
}


function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}


export {
    randomWord,
    shuffle,
}
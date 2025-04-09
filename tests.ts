import {scs, validate} from "./scs.ts";
import { test } from "node:test";
import assert from 'node:assert/strict';

test('Basic combine cases', () => {
    assert.equal('mpoonr', validatedScs(["moon", "poor"]));
    assert.equal('mspoonark', validatedScs(["moon","spark","mark","poor"]));
    assert.equal('mspoonark', validatedScs(["moon", "poor", "spark", "mark"]));
    assert.equal('saparkple', validatedScs(["spark","apple"]));
})

test('Repeat cases', () => {
    assert.equal('aaaaa', validatedScs(["aaaa", "aaaaa", "aa"]));
    assert.equal('bdaaa', validatedScs(["baaa", "daaa"]));
    assert.equal('bcdaaaaa', validatedScs(["baaaaa", "caaaaa", "daaa"]));
    assert.equal('bcaaaaa', validatedScs(["baaaaa", "caaaaa"]));
    assert.equal('bcdaaa', validatedScs(["baaa", "caaa", "daa"]));
    assert.equal('bcaaaa', validatedScs(["baaaa", "caaa"]));
    assert.equal('aaaaa', validatedScs(["aaaa", "aaaaa", "aa"]))
});

test('SO cases', () => {
    assert.equal('jmspachoorkpplivend', validatedScs(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"]))
});

test('permutations', () => {
    // this test is kinda jank but it is helpful for dev

    for(let i = 0; i < 50000; i++) {
        const words = shuffle(["maven","hold","moon","mark","jack","spark","poor","apple","solid","live"]);
        const result = validatedScs(words);
        if(result.length !== 19) {
            console.log(result.length + ' ' + result);
            console.log(JSON.stringify(words))
            assert.fail('Invalid scs result, should have always been 19');
            break;
        }
    }
});

/**
 * Runs scs and validates the result
 * @param words
 * @param debug
 */
function validatedScs(words: string[], debug = false) {
    const result = scs(words, debug);
    const validation = validate(result, words);
    if(!validation.valid) {
        console.log('Invalid', result, validation.invalidWords);
        assert.fail('Invalid scs result');
    }
    return result;
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
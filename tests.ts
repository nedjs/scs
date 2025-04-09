import {scs, validate} from "./scs.ts";
import { test } from "node:test";
import assert from 'node:assert/strict';

test('profiling', () => {
    validatedScs(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"], {
        profile: true,
    })
})

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

test('really big repeat', () => {
    const len = 30;
    assert.equal(
        Array(len).fill('a').join(''),
        validatedScs([
            Array(len).fill('a').join(''),
            Array(len-1).fill('a').join(''),
            Array(len-2).fill('a').join('')
        ], {
            profile: true,
        })
    );
});

test('SO cases', () => {
    assert.equal('jmspachoorkpplivend', validatedScs(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"]))
});

test('Words that share nothing in common', () => {
    assert.equal('jackmournbelt', validatedScs(["jack", "mourn", "belt"]))
});

test('Words that share everything in common', () => {
    assert.equal('maven', validatedScs(["maven", "maven", "maven"]))
});

test('permutations', () => {
    // this test is kinda jank as it just does random variations but it is helpful for dev

    for(let i = 0; i < 50000; i++) {
        const words = shuffle(["maven","hold","moon","mark","jack","spark","poor","apple","solid","live"]);
        const result = validatedScs(words);
        if(result.length !== 19) {
            console.log(result.length + ' ' + result);
            console.log(JSON.stringify(words))
            assert.fail('Invalid scs result, should have always been 19');
        }
    }
});

/**
 * Runs scs and validates the result
 */
function validatedScs(words: string[], options: {
    debug?: boolean;
    profile?: boolean;
} = {}) {
    const result = scs(words, options);
    const validation = validate(result, words);
    if(!validation.valid) {
        console.log('Invalid', result, validation.invalidWords);
        assert.fail('Invalid scs result ' + result + ' ' + validation.invalidWords);
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
import {scs, validate} from "./scs.ts";
import { test } from "node:test";
import assert from 'node:assert/strict';
import {randomWord} from "./data.ts";

test('profiling', () => {
    validatedScs(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"], {
        profile: true,
    })
})
test('result', () => {
    const values = ["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"];
    values.sort();
    const result = validatedScs(values, {
        profile: true,
    })
    // jmspappholivedcorkn
    // spmjhooarckpplivden
    console.log(result)
})

test('debug', () => {
    assert.equal(validatedScs(["mooon", "pooor"], {
        debug: true,
    }), 'mpooonr');
})

test('Basic combine cases', () => {
    assert.equal(validatedScs(["moon", "poor"]), 'mpoonr');
    assert.equal(validatedScs(["moon","spark","mark","poor"]), 'mspoonark');
    assert.equal(validatedScs(["moon", "poor", "spark", "mark"]), 'mspoonark');
    assert.equal(validatedScs(["spark","apple"]), 'saparkple');
})

test('Repeat cases', () => {
    assert.equal(validatedScs(["aaaa", "aaaaa", "aa"]), 'aaaaa');
    assert.equal(validatedScs(["baaa", "daaa"]), 'bdaaa');
    assert.equal(validatedScs(["baaaaa", "caaaaa", "daaa"]), 'bcdaaaaa');
    assert.equal(validatedScs(["baaaaa", "caaaaa"]), 'bcaaaaa');
    assert.equal(validatedScs(["baaa", "caaa", "daa"]), 'bcdaaa');
    assert.equal(validatedScs(["baaaa", "caaa"]), 'bcaaaa');
    assert.equal(validatedScs(["aaaa", "aaaaa", "aa"]), 'aaaaa')
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
    assert.equal(validatedScs(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"]), 'jmspachoorkpplivend')
});

test('Words that share nothing in common', () => {
    assert.equal(validatedScs(["jack", "mourn", "belt"]), 'jackmournbelt')
});

test('Words that share everything in common', () => {
    assert.equal(validatedScs(["maven", "maven", "maven"]), 'maven')
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

//
// test('permutations random words', () => {
//     // this test is kinda jank as it just does random variations but it is helpful for dev
//     for(let i = 0; i < 500; i++) {
//         const words = Array(5).fill(null).map(() => randomWord());
//         validatedScs(words);
//     }
// });

test('bbbaaaba', () => {
    // bbabaaaabbba
    console.log(validate("bbbabaababb", ["bbbaaaba", "bbababbb"]));
    assert.equal(validatedScs(["bbbaaaba", "bbababbb"], {
        debug: true
    }), 'bbabaaabbba');
});
test('bbbaaaba simplified', () => {
    /*
    bbababb
    bba ab a
    bbababba
     */
    assert.equal(validate("bbababba", ["bbaaba", "bbababb"]).valid, true);
    assert.equal(validatedScs(["bbaaba", "bbababb"], {
        debug: true
    }), 'bbababba');
});

test('baaacbcbaca', () => {
    assert.equal(validate("baaacbcbaca", ["baaacbcbc", "bacbcaca"]).valid, true);
    assert.equal(validatedScs(["baaacbcbc", "bacbcaca"], {
        debug: true
    }), 'baaacbcbaca');
});

test('cccabbabacaab', () => {
    assert.equal(validate("cccabbabacaab", ["bbabacaa", "cccababab"]).valid, true);
    assert.equal(validatedScs(["bbabacaa", "cccababab"], {
        debug: true
    }), 'cccabbabacaab');
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
        console.log(JSON.stringify(words));
        console.log(JSON.stringify(validation));
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
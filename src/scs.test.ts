import {scs, validate} from "./scs.ts";
import { test, describe } from "node:test";
import assert from 'node:assert/strict';
import {randomWord, shuffle} from "./util/util.ts";
import {Radix} from "./util/Radix.ts";
import {scsLcsMethod} from "./lcs.ts";

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

describe('Basic combine cases', () => {
    test('mpoonr', () => { assertScsWithExample(["moon", "poor"], 'mpoonr') });
    test('mspoonark', () => { assertScsWithExample(["moon","spark","mark","poor"], 'mspoonark') });
    test('mspoonark-2', () => { assertScsWithExample(["moon", "poor", "spark", "mark"], 'mspoonark') });
    test('saparkple', () => { assertScsWithExample(["spark","apple"], 'saparkple') });
})

describe('repeat cases', () => {
    test('aaaaa', () => { assertScsWithExample(["aaaa", "aaaaa", "aa"], 'aaaaa') });
    test('bdaaa', () => { assertScsWithExample(["baaa", "daaa"], 'bdaaa') });
    test('bcdaaaaa', () => { assertScsWithExample(["baaaaa", "caaaaa", "daaa"], 'bcdaaaaa') });
    test('bcaaaaa', () => { assertScsWithExample(["baaaaa", "caaaaa"], 'bcaaaaa') });
    test('bcdaaa', () => { assertScsWithExample(["baaa", "caaa", "daa"], 'bcdaaa') });
    test('bcaaaa', () => { assertScsWithExample(["baaaa", "caaa"], 'bcaaaa') });
});

test('really big repeat', () => {
    const len = 100;
    assert.equal(
        Array(len).fill('a').join(''),
        validatedScs([
            Array(len).fill('a').join(''),
            Array(len-1).fill('a').join('')
        ], {
            profile: true,
        })
    );
});

test('SO cases', () => {
    assertScsWithExample(["jack", "apple", "maven", "hold", "solid", "mark", "moon", "poor", "spark", "live"], "jmspachoorkpplivend")
});

test('Words that share nothing in common', () => {
    assert.equal(validatedScs(["jack", "mourn", "belt"]), 'jackmournbelt')
});

test('Words that share everything in common', () => {
    assert.equal(validatedScs(["maven", "maven", "maven"]), 'maven')
});

test('permutations of SO case', () => {
    // this test is kinda jank as it just does random variations but its helpful to find bugs
    for(let i = 0; i < 5000; i++) {
        const words = shuffle(["maven","hold","moon","mark","jack","spark","poor","apple","solid","live"]);
        const result = validatedScs(words);
        assertScsWithExample(words, "jmspachoorkpplivend");
    }
});

test('permutations random words', () => {
    // grab 5 random words and combine them, mostly for dev testing not testing anything specific
    for(let i = 0; i < 5000; i++) {
        const words = Array(5).fill(null).map(() => randomWord());
        validatedScs(words);
    }
});

test('bbbaaaba', () => {
    assertScsWithExample(["bbbaaaba", "bbababbb"], "bbabaaabbba")
});
test('bbbaaaba simplified', () => {
    assertScsWithExample(["bbaaba", "bbababb"], "bbaababb")
});


describe('l33t cases', () => {
    test('29/50', () => { assertScsWithExample([
            "bcaaacbbbcbdcaddadcacbdddcdcccdadadcbabaccbccdcdcbcaccacbbdcbabb",
            "dddbbdcbccaccbababaacbcbacdddcdabadcacddbacadabdabcdbaaabaccbdaa"
        ],
        "dddbbdcbccaaaccbababaacbdcbacddadcdacbadddcacdcccdbadcadcbabdaccbccdcdcbcaaabaccacbbdcbabba", {
            profile: true,
        })
    });
    test('47/50', () => { assertScsWithExample([
            "atdznrqfwlfbcqkezrltzyeqvqemikzgghxkzenhtapwrmrovwtpzzsyiwongllqmvptwammerobtgmkpowndejvbuwbporfyroknrjoekdgqqlgzxiisweeegxajqlradgcciavbpgqjzwtdetmtallzyukdztoxysggrqkliixnagwzmassthjecvfzmyonglocmvjnxkcwqqvgrzpsswnigjthtkuawirecfuzrbifgwolpnhcapzxwmfhvpfmqapdxgmddsdlhteugqoyepbztspgojbrmpjmwmhnldunskpvwprzrudbmtwdvgyghgprqcdgqjjbyfsujnnssfqvjhnvcotynidziswpzhkdszbblustoxwtlhkowpatbypvkmajumsxqqunlxxvfezayrolwezfzfyzmmneepwshpemynwzyunsxgjflnqmfghsvwpknqhclhrlmnrljwabwpxomwhuhffpfinhnairblcayygghzqmotwrywqayvvgohmujneqlzurxcpnwdipldofyvfdurbsoxdurlofkqnrjomszjimrxbqzyazakkizojwkuzcacnbdifesoiesmkbyffcxhqgqyhwyubtsrqarqagogrnaxuzyggknksrfdrmnoxrctntngdxxechxrsbyhtlbmzgmcqopyixdomhnmvnsafphpkdgndcscbwyhueytaeodlhlzczmpqqmnilliydwtxtpedbncvsqauopbvygqdtcwehffagxmyoalogetacehnbfxlqhklvxfzmrjqofaesvuzfczeuqegwpcmahhpzodsmpvrvkzxxtsdsxwixiraphjlqawxinlwfspdlscdswtgjpoiixbvmpzilxrnpdvigpccnngxmlzoentslzyjjpkxemyiemoluhqifyonbnizcjrlmuylezdkkztcphlmwhnkdguhelqzjgvjtrzofmtpuhifoqnokonhqtzxmimp",
            "xjtuwbmvsdeogmnzorndhmjoqnqjnhmfueifqwleggctttilmfokpgotfykyzdhfafiervrsyuiseumzmymtvsdsowmovagekhevyqhifwevpepgmyhnagjtsciaecswebcuvxoavfgejqrxuvnhvkmolclecqsnsrjmxyokbkesaugbydfsupuqanetgunlqmundxvduqmzidatemaqmzzzfjpgmhyoktbdgpgbmjkhmfjtsxjqbfspedhzrxavhngtnuykpapwluameeqlutkyzyeffmqdsjyklmrxtioawcrvmsthbebdqqrpphncthosljfaeidboyekxezqtzlizqcvvxehrcskstshupglzgmbretpyehtavxegmbtznhpbczdjlzibnouxlxkeiedzoohoxhnhzqqaxdwetyudhyqvdhrggrszqeqkqqnunxqyyagyoptfkolieayokryidtctemtesuhbzczzvhlbbhnufjjocporuzuevofbuevuxhgexmckifntngaohfwqdakyobcooubdvypxjjxeugzdmapyamuwqtnqspsznyszhwqdqjxsmhdlkwkvlkdbjngvdmhvbllqqlcemkqxxdlldcfthjdqkyjrrjqqqpnmmelrwhtyugieuppqqtwychtpjmloxsckhzyitomjzypisxzztdwxhddvtv"
        ],
        "axjtuwbmvsdzeogmnzorndhmjoqnqjnhmfwlueifbcqkezrwltzyeqvqemggctttilmfokzpgghxotfykyzendhtfapwfiermrovwtpzzrsyuiwongllqseumvpzmymtvsdsowammerobtvagmekpowndhejvbuwbporfyroknrjoekdgqqlgzxhiisfwevpeepgxmyhnajqlradgjtscciavbpgqjzecswtdetmtallzybcukdztovxysoavfggrejqkliirxuvnagwzmassthjecvfzkmyonglocmvjnxklecwqqvgrzpsswnigsrjthtmxyokuawirbkecfsauzrbifgwolpnhcapzxwmbydfhvsupfmuqapdxnetgunlqmundxvdsuqmzidlhateugmaqoyepbmztspgozzfjbrmpjgmwmhnldunsyokpvwprzrudbmtwbdvgyghgprqcdgqjjbyfsumjnnsskhmfqvjhnvcotynidziswxjqbfspzhkedshzbblustorxwtlhkowpavhngtbnuypvkmpajpwluamsxeeqqunlxxvfeutkyzayrolwezfzfyzmmneepwshpemynwzyunsxgjflnqmfghdsvwpjyknqhclhrlmnrljwabwpxtiomawcrvmsthuhffbebdqqrpfinphncthosljfaeirdblcaoyygghekxezqmotwrywzlizqaycvvgoxehmrcskstshujneqpglzugmbrxcetpnwdipldofyehtavfdurbsoxdurlofkqnrjoegmsbtzjimrxnhpbqczyadjlzakkizbnojwkuzcacnbdifxlxkesoiesmkbyffcdzoohoxhnhzqgqyhaxdwetyubtsrdhyqavdhrqagogrszqeqkqqnaxuznxqyyaggyoptfknolieayoksrfyidrmnoxrtctnemtngdxxechxrsbyuhtlbmzgmcqopyixdomhnmzzvnsafphpkdgndcsclbwybhnueytaefjjodlhlzczmpqqmnilliydwtxtporuzuedbncvsqauopfbvygqdtcwuevuxhffagexmyoalogeckifntngaceohnbfxlwqhdaklyobcooubdvypxfzmrjqofajxesvuzfczeuqegwpcmahhpzodsmpvrvkzxxtsdsxwixiraphjlqyamuwxiqtnlwfqspdlscdznyszhwtgqdqjpoiixbvsmpzilxrnphdlkwkvigpcclkdbjnngxvdmhvblzolqqlcentsmkqxxdlzldcfthjdqkyjrrjqqqpkxenmmelrwhtyugiemoluhppqifqtwyonbnizchtpjrlmuylezdkkztoxscphlmwhnkdguhelqzjgvjyitrzofmtjzypuhifoqnokonhqtsxzztdwxmimphddvtv", {
            profile: true,
        })
    });
});

describe('ab tests', () => {
    test('aba-bab', () => { assertScsWithExample(["aba", "bab"], "baba", {debug: true}) });
    test('aaba-abaa', () => { assertScsWithExample(["aaba", "abaa"], "aabaa") });
    test('aaba-baaa', () => { assertScsWithExample(["aaba", "baaa"], "baaba") });
    test('aaaa-abbb', () => { assertScsWithExample(["aaaa", "abbb"], "aaaabbb") });
    test('aabb-baab', () => { assertScsWithExample(["aabb", "baab"], "baabb") });
    test('aaba-baab', () => { assertScsWithExample(["aaba", "baab"], "baaba") });
    test('aabb-babb', () => { assertScsWithExample(["aabb", "babb"], "baabb") });

    test('aaba-aabb', () => { assertScsWithExample(["aaba", "aabb"], "aabab") });
    test('aabb-aaba', () => { assertScsWithExample(["aabb", "aaba"], "aabba") });
    test('abaa-baab', () => { assertScsWithExample(["abaa", "baab"], "abaab") });
    test('abba-babb', () => { assertScsWithExample(["abba", "babb"], "babba") });
    test('abba-bbab', () => { assertScsWithExample(["abba", "bbab"], "abbab") });
    test('baab-aaba', () => { assertScsWithExample(["baab", "aaba"], "baaba") });
    test('baab-abaa', () => { assertScsWithExample(["baab", "abaa"], "abaab") });
    test('babb-abba', () => { assertScsWithExample(["babb", "abba"], "babba") });
    test('bbaa-bbab', () => { assertScsWithExample(["bbaa", "bbab"], "bbaab") });
    test('bbab-abba', () => { assertScsWithExample(["bbab", "abba"], "abbab") });
    test('bbab-bbaa', () => { assertScsWithExample(["bbab", "bbaa"], "bbaba") });
    test('abab-aaab', () => { assertScsWithExample(["abab", "aaab"], "abaab") });
    test('abab-baab', () => { assertScsWithExample(["abab", "baab"], "abaab") });
    test('abba-abab', () => { assertScsWithExample(["abba", "abab"], "abbab") });
    test('abbb-abab', () => { assertScsWithExample(["abbb", "abab"], "ababb") });
    test('baaa-baba', () => { assertScsWithExample(["baaa", "baba"], "babaa") });
    test('baab-baba', () => { assertScsWithExample(["baab", "baba"], "baaba") });
    test('baba-abba', () => { assertScsWithExample(["baba", "abba"], "babba") });
    test('baba-bbba', () => { assertScsWithExample(["baba", "bbba"], "babba") });

    test('baaacbcbaca', () => { assertScsWithExample(["baaacbcbc", "bacbcaca"], "baaacbcbaca") });
    test('cccabbabacaab', () => { assertScsWithExample(["bbabacaa", "cccababab"], "cccabbabacaab") });
});


/**
 * I wanted to test all valid combinations of N words. This test will fail and spit
 * out tests for all the invalid combinations. I can then copy/paste them into the test suite
 */
test('generate new ab tests', () => {
    const radix = new Radix("abcd");
    const length = 4;
    const upper = Math.pow(radix.base, length);
    let foundTestCase = false;

    const genTestCase = (a: string, b: string) => {
        const scsv = validatedScs([a, b]);
        const scss = scsLcsMethod(a, b);

        if(scsv.length !== scss.length) {
            console.log(`test('${a}-${b}', () => { assertScsWithExample(["${a}", "${b}"], "${scss}") });`);
            foundTestCase = true;
        }
    }

    for(let a=0;a<upper;a++) {
        for(let b=0;b<upper;b++) {
            // i want the leftpad version and the non leftpad version
            genTestCase(radix.fromNumber(a), radix.fromNumber(b));
            genTestCase(radix.fromNumber(a).padStart(length, 'a'), radix.fromNumber(b).padStart(length, 'a'));
        }
    }
    if(!foundTestCase) {
        console.log(' All were valid, no test cases found!');
    } else {
        assert.fail('Found test cases, add them to the test suite');
    }
})

function assertScsWithExample(words: string[], exampleOutput: string, options: {
    debug?: boolean;
    profile?: boolean;
} = {}) {
    const result = validatedScs(words, options);
    if(result.length !== exampleOutput.length) {
        console.log('Invalid', result);
        console.log(JSON.stringify(words));
        assert.fail(`Invalid scs result` +
            `\nexpected: '${exampleOutput}' of length ${exampleOutput.length}` +
            `\nactual:   '${result}' of length ${result.length}`
        );
    }
    assert.equal(validate(exampleOutput, words).valid, true, `Invalid test case, example output ${exampleOutput} for words ${words} is not valid`);
    return result;
}


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
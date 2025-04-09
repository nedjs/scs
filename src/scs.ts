import {CustomSet} from "./util/CustomSet.ts";
import {DEBUG} from "./constants.ts";

class C {
    readonly index: number;
    readonly word: string;
    readonly value: string;
    readonly links: Array<Link> = [];

    constructor(index: number, word: string) {
        this.index = index;
        this.word = word;
        this.value = word[index];
    }
}

class Link {
    static idCounter = 0;
    // prefixed with d_ to indiciate they are debug only props, i like keeping them around for debugging
    readonly d_id;
    readonly d_l;
    readonly a: C;
    readonly b: C;

    constructor(a: C, b: C) {
        if (a.word === b.word) {
            throw new Error(`Invalid link between same word ${a.word}`);
        }
        // only used in debugging
        if(DEBUG) {
            // this style of ID is very nice for debugging
            this.d_id = `${Link.idCounter++}/${a.index}-${b.index}`;
            this.d_l = a.value;
        }
        this.a = a;
        this.b = b;
        this.a.links.push(this);
        this.b.links.push(this);
    }

    isForWord(word: string) {
        return this.a.word === word || this.b.word === word;
    }

    indexRel(word: string) {
        if (this.a.word === word) {
            return this.a.index;
        } else if (this.b.word === word) {
            return this.b.index;
        }
        return -1;
    }

    opposingWord(word: string) {
        if (this.a.word === word) {
            return this.b.word;
        } else if (this.b.word === word) {
            return this.a.word;
        }
        return '';
    }
    opposingSide(word: string) {
        if (this.a.word === word) {
            return this.b;
        } else if (this.b.word === word) {
            return this.a;
        }
        throw new Error(`Invalid word for word '${word}' for '${this.a.word}' and '${this.b.word}'`);
    }
}

class Linking {
    words: C[][] = [];
    wordsDict: Record<string, C[]> = {};

    constructor(words: string[]) {
        for (const word of words) {
            this.addWord(word);
        }
    }

    addWord(word: string) {
        const buff = [new C(0, word)];
        for (let i = 1; i < word.length; i++) {
            const c = new C(i, word);
            buff.push(c);
        }
        this.words.push(buff);
        this.wordsDict[word] = buff;
    }
}

function findBestLinkSet(linking: Linking) {
    const final = new CustomSet<Link>();
    const words = linking.words
    for(let i=0;i<words.length;i++) {
        for(let j=i+1;j<words.length;j++) {
            let wordA = words[i][0].word, wordB = words[j][0].word;
            if(wordA !== wordB) {
                createLinksForLCS(wordA, wordB, linking);
            }
        }
    }
    return final;
}


function scoreLinks(linking: Linking) {
    findBestLinkSet(linking);
    return void 0;
}

function walkLinks(linking: Linking, options: {
    debug?: boolean;
    profile?: boolean;
}) {
    let {debug} = options;

    const indices = {};
    const lookingAtLinks = new CustomSet<Link>();
    const lookingAtWords = new CustomSet<string>();

    const walk = (letters: C[], toIndex: number, depth = 0) => {
        const word = letters[0].word;

        const log = (symbol: string, ...args: any[]) => {
            console.log(Array(depth).fill('|  ').join('')+symbol, ...args);
        }

        if(toIndex === indices[word]) {
            debug && log('/', word, 'to', (letters[toIndex]?.value || '+'), indices[word], '-', toIndex)
            return '';
        }

        debug && log('>', word, 'to', (letters[toIndex]?.value || 'END'), indices[word], '-', toIndex)
        debug && log('i', Object.entries(indices).map(v => `${v[0]}:${v[1]}`).join(', '));

        lookingAtWords.add(word);

        let left = '';
        while(indices[word] < toIndex) {
            const letter = letters[indices[word]];

            const walkableLinks = letter.links
                .map(v => ({
                    link: v,
                    word: v.opposingWord(word),
                    ix: v.opposingSide(word).index,
                }))
                .filter(v =>
                    !lookingAtWords.has(v.word) &&
                    !lookingAtLinks.find(l => l.isForWord(v.word) && l.indexRel(v.word) < indices[v.word])
                )

            for(const v of walkableLinks) {
                lookingAtLinks.add(v.link);
            }
            let leftBuf = '';
            for (const v of walkableLinks) {
                const nextWord = linking.wordsDict[v.word];
                if(indices[v.word] <= v.ix) {
                    const buf = walk(nextWord, v.ix, depth+1);

                    leftBuf += buf;
                    indices[v.word]++;
                }
            }
            for(const v of walkableLinks) {
                lookingAtLinks.delete(v.link);
            }

            if(leftBuf && walkableLinks.find(v => indices[v.word] > v.ix+1)) {
                debug && log('!', letter.value);
                leftBuf = letter.value + leftBuf;
            }

            leftBuf += letter.value;

            debug && log('+', `${left} + ${leftBuf}`);
            left += leftBuf;

            if(indices[word] === letter.index) {
                indices[word]++
            }
        }

        debug && log('<', left + ' ' + indices[word] )
        lookingAtWords.delete(word);
        return left;
    }

    let buffer = '';
    for (const word of linking.words) {
        indices[word[0].word] = 0;
    }
    for (const word of linking.words) {
        buffer += walk(word, word.length, 0);
    }

    return buffer;
}

function scs(words: string[], options: {
    debug?: boolean;
    profile?: boolean;
} = {}) {
    options.profile && console.time('total');

    options.profile && console.time('linking');
    const linking = new Linking(words);
    options.profile && console.timeEnd('linking');

    options.profile && console.time('scoring');
    scoreLinks(linking);
    options.profile && console.timeEnd('scoring');

    options.profile && console.time('walk');
    const result = walkLinks(linking, options);
    options.profile && console.timeEnd('walk');

    options.profile && console.timeEnd('total');
    return result;
}


function prepareLCS(str1: string, str2: string) {
    let n = str1.length, m = str2.length;
    let dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (str1[i] === str2[j]) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let x = 0, y = 0;
    let lcs = "";
    while (x < n && y < m) {
        if (str1[x] === str2[y]) {
            lcs += str1[x];
            x++;
            y++;
        } else if (dp[x + 1][y] >= dp[x][y + 1]) {
            x++;
        } else {
            y++;
        }
    }

    return {
        lcs,
        n,
        m,
    }
}

/**
 * walks the longest common supersequence of two strings and creates links between the letters, putting them into linking
 */
function createLinksForLCS(str1: string, str2: string, linking: Linking) {
    const {lcs, n, m} = prepareLCS(str1, str2);
    let x = 0;
    let y = 0;
    for (let c of lcs) {
        while (x < n && str1[x] !== c) x++;
        while (y < m && str2[y] !== c) y++;

        new Link(linking.wordsDict[str1][x], linking.wordsDict[str2][y]);
        x++;
        y++;
    }
}

/**
 * Finds the shortest common supersequence of two strings. This is a known method of doing it
 * for 2 strings, used for validating results from the generic scs case.
 */
function scsTwoWords(str1: string, str2: string) {
    const {lcs, n, m} = prepareLCS(str1, str2);
    let result = "";
    let x = 0;
    let y = 0;
    for (let c of lcs) {
        while (x < n && str1[x] !== c) result += str1[x++];
        while (y < m && str2[y] !== c) result += str2[y++];

        result += c;
        x++;
        y++;
    }

    result += str1.slice(x) + str2.slice(y);
    return result;
}

/**
 * Validates a string against a list of words. It checks if the value is a valid SCS for the words
 */
function validate(value: string, words: string[]): {
    valid: boolean;
    invalidWords: string[];
} {
    const invalidWords: string[] = [];
    for(const word of words) {
        let offset = 0;
        for(let i = 0; i < word.length; i++) {
            const char = word[i];
            let foundLetter = false;
            while(!foundLetter && offset < value.length) {
                if(value[offset] === char) {
                    foundLetter = true;
                }
                offset++;
            }

            if(!foundLetter && offset >= value.length && i <= word.length) {
                invalidWords.push(word);
                break;
            }
        }
    }

    return {
        valid: invalidWords.length === 0,
        invalidWords,
    };
}

export {
    scs,
    scsTwoWords,
    validate,
}
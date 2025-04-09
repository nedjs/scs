import {CustomSet} from "./util/CustomSet.ts";
import {DEBUG} from "./constants.ts";

class C {
    readonly index: number;
    readonly word: string;
    readonly value: string;
    readonly links: CustomSet<Link> = new CustomSet();

    constructor(index: number, word: string) {
        this.index = index;
        this.word = word;
        this.value = word[index];
    }
}

class Link {
    static idCounter = 0;
    readonly id;
    readonly d_l;
    readonly a: C;
    readonly b: C;
    exclusiveWith: CustomSet<Link> = new CustomSet();

    constructor(a: C, b: C) {
        if (a.word === b.word) {
            throw new Error(`Invalid link between same word ${a.word}`);
        }
        // this style of ID is very nice for debugging
        if(DEBUG) {
            this.id = `${Link.idCounter++}/${a.index}-${b.index}`;
        } else {
            this.id = String(Link.idCounter++);
        }
        // only used in debugging
        if(DEBUG) {
            this.d_l = a.value;
        }
        this.a = a;
        this.b = b;
        this.a.links.add(this);
        this.b.links.add(this);
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

    sideForWord(word: string) {
        if (this.a.word === word) {
            return this.a;
        } else if (this.b.word === word) {
            return this.b;
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

    addLink(link: Link) {
        link.a.links.add(link);
        link.b.links.add(link);
    }

    addWord(word: string) {
        const buff = [new C(0, word)];
        // this.add(buff[0]);
        for (let i = 1; i < word.length; i++) {
            const c = new C(i, word);
            buff.push(c);
            // this.add(c);
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
                scsWalk(wordA, wordB, linking);
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

    debug = debug && DEBUG;

    const indices = {};
    const lookingAtLinks = new CustomSet<Link>();
    const addedLinks = new CustomSet<Link>();
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
                    ix: v.sideForWord(v.opposingWord(word)).index,
                }))
                .filter(v =>
                    !lookingAtWords.has(v.word) &&
                    !lookingAtLinks.find(l => l.isForWord(v.word) && l.indexRel(v.word) < indices[v.word])
                )
                // cant have 2 links to the same word
                .distinctBy((v) => v.word)

            lookingAtLinks.addAll(walkableLinks.map(v => v.link));
            let leftBuf = '';
            for (const v of walkableLinks) {
                const nextWord = linking.wordsDict[v.word];
                if(indices[v.word] <= v.ix) {
                    const buf = walk(nextWord, v.ix, depth+1);

                    leftBuf += buf;
                    indices[v.word]++;
                }
            }
            lookingAtLinks.deleteAll(walkableLinks.map(v => v.link));

            if(leftBuf && walkableLinks.find(v => indices[v.word] > v.ix+1 && !addedLinks.has(v.link))) {
                debug && log('!', letter.value);
                leftBuf = letter.value + leftBuf;
            }
            addedLinks.addAll(letter.links);

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

function scsWalk(str1: string, str2: string, linking: Linking) {

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

    let result = "";
    x = 0;
    y = 0;
    for (let c of lcs) {
        while (x < n && str1[x] !== c) result += str1[x++];
        while (y < m && str2[y] !== c) result += str2[y++];


        linking.addLink(new Link(linking.wordsDict[str1][x], linking.wordsDict[str2][y]))

        result += c;
        x++;
        y++;
    }
}

function scsSingle(str1: string, str2: string) {

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

    let result = "";
    x = 0;
    y = 0;
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
    scsSingle,
    validate,
}
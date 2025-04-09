import {CustomSet} from "./CustomSet.ts";

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
    readonly l;
    readonly a: C;
    readonly b: C;
    score: number = Infinity;
    bestScoreInSet: number = Infinity;
    readonly exclusiveWith: CustomSet<Link> = new CustomSet();

    constructor(a: C, b: C) {
        if (a.word === b.word) {
            throw new Error(`Invalid link between same word ${a.word}`);
        }
        this.l = a.value;
        this.a = a;
        this.b = b;
        this.a.links.add(this);
        this.b.links.add(this);
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
    links: Link[] = []
    words: C[][] = [];
    wordsDict: Record<string, C[]> = {};
    private charByLetter: Record<string, C[]> = {};
    wordLinks: Record<string, Record<string, Link[]>> = {}

    constructor(words: string[]) {
        for (const word of words) {
            this.addWord(word);
        }
    }


    private addWord(word: string) {
        const buff = [new C(0, word)];
        this.add(buff[0]);
        for (let i = 1; i < word.length; i++) {
            const c = new C(i, word);
            buff.push(c);
            this.add(c);
        }
        this.words.push(buff);
        this.wordsDict[word] = buff;
    }

    private add(a: C) {
        this.charByLetter[a.value] = this.charByLetter[a.value] || [];
        this.charByLetter[a.value].push(a);

        for (const b of this.charByLetter[a.value]) {
            if (b.word === a.word) continue;

            const link = new Link(a, b);
            this.links.push(link);

            this.wordLinks[a.word] = this.wordLinks[a.word] || {};
            this.wordLinks[a.word][b.word] = this.wordLinks[a.word][b.word] || [];
            this.wordLinks[a.word][b.word].push(link)
            this.wordLinks[a.word][b.word].sort((aL, bL) => aL.indexRel(b.word) - bL.indexRel(b.word));

            this.wordLinks[b.word] = this.wordLinks[b.word] || {};
            this.wordLinks[b.word][a.word] = this.wordLinks[b.word][a.word] || [];
            this.wordLinks[b.word][a.word].push(link)
            this.wordLinks[b.word][a.word].sort((aL, bL) => aL.indexRel(a.word) - bL.indexRel(a.word));
        }

    }
}


function scoreLinks(linking: Linking) {
    for (const link of linking.links) {
        let score = linking.wordLinks[link.a.word][link.b.word].filter(v => {
            const aIx = v.indexRel(link.a.word);
            const bIx = v.indexRel(link.b.word);
            return  (aIx < link.a.index) !== (bIx < link.b.index) && bIx != link.b.index && aIx != link.a.index
        });
        link.score = score.length;
    }
    for (const link of linking.links) {
        let exclusiveLinks = linking.wordLinks[link.a.word][link.b.word].filter(v =>
            v.indexRel(link.a.word) == link.a.index || v.indexRel(link.b.word) == link.b.index ||
            (v.indexRel(link.b.word) < link.b.index) !== (v.indexRel(link.a.word) < link.a.index));

        let bestScore = link.score;
        for (const v of exclusiveLinks) {
            // check if this link is going to be ignored
            if(v.bestScoreInSet < v.score) continue;
            bestScore = Math.min(bestScore, v.score);
        }

        link.bestScoreInSet = bestScore;
        link.exclusiveWith.addAll(exclusiveLinks);
    }

    let updatedScores: boolean;
    do {
        updatedScores = false;

        for (const link of linking.links) {
            let exclusiveLinks = linking.wordLinks[link.a.word][link.b.word]
                .filter(v => v.bestScoreInSet === v.score)
                .filter(v => v.indexRel(link.a.word) == link.a.index || v.indexRel(link.b.word) == link.b.index);

            let bestScore = exclusiveLinks
                .reduce((t, v) => Math.min(t, v.score), link.score);

            if(link.bestScoreInSet !== bestScore) {
                updatedScores = true;
                link.bestScoreInSet = bestScore;
            }
        }
    } while(updatedScores);
}

function walkLinks(linking: Linking, options: {
    debug?: boolean;
    profile?: boolean;
}) {
    const {debug} = options;
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
                    v.link.bestScoreInSet === v.link.score &&
                    !lookingAtWords.has(v.word) &&
                    !lookingAtLinks.find(l => (v.word === l.a.word || v.word === l.b.word) && l.indexRel(v.word) < indices[v.word]
                ))
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
            lookingAtLinks.removeAll(walkableLinks.map(v => v.link));

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

function validate(value: string, words: string[]): {
    valid: boolean;
    invalidWords: string[];
} {
    const invalidWords: string[] = [];
    for(const word of words) {
        let offset = 0;
        for(let i = 0; i < word.length; i++) {
            const char = word[i];
            for (; offset < value.length; offset++) {
                if(value[offset] === char) {
                    offset++;
                    break;
                }
            }

            if(offset >= value.length && i + 1 < word.length) {
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
    validate,
}
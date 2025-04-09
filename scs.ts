class C {
    readonly index: number;
    readonly word: string;
    readonly value: string;
    readonly links: Set<Link> = new Set();

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
    readonly exclusiveWith: Set<Link> = new Set();

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
            buff.push(new C(i, word));
            this.add(buff[buff.length - 1]);
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
        addAll(link.exclusiveWith, exclusiveLinks);
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

function walkLinks(linking: Linking, debug = false) {
    const indices = {};
    const lookingAtLinks = new Set<Link>();
    const addedLinks = new Set<Link>();
    const lookingAtWords = new Set<string>();

    const walk = (word: C[], toIndex: number, depth = 0) => {
        lookingAtWords.add(word[0].word);

        const ident = Array(depth).fill('|  ').join('');
        const log = (...args) => {
            if(debug) {
                console.log(ident+args[0], ...args.slice(1));
            }
        }

        const wordStr = word[0].word;

        if(toIndex === indices[wordStr]) {
            log('/', wordStr, 'to', (word[toIndex]?.value || '+'), indices[wordStr], '-', toIndex)
            lookingAtWords.delete(word[0].word);
            return '';
        }

        log('>', wordStr, 'to', (word[toIndex]?.value || 'END'), indices[wordStr], '-', toIndex)
        log('i', Object.entries(indices).map(v => `${v[0]}:${v[1]}`).join(', '));
        let left = '';
        for (; indices[wordStr] < toIndex; ) {
            const letter = word[indices[wordStr]];

            const walkableLinks = [...letter.links]
                .filter(v => v.bestScoreInSet === v.score)
                .map(v => ({
                    link: v,
                    word: v.opposingWord(wordStr),
                    ix: v.sideForWord(v.opposingWord(wordStr)).index,
                }))
                .filter(v => !lookingAtLinks.has(v.link))
                .filter(v => {
                    return ![...lookingAtLinks].find(l =>
                        (v.word === l.a.word || v.word === l.b.word) && l.indexRel(v.word) < indices[v.word]
                    );
                })
                .filter(v => !lookingAtWords.has(v.word))
                .filter((v, i, a) => {
                    // cant have 2 links to the same word
                    return a.findIndex(v2 => v.word === v2.word) === i;
                })

            addAll(lookingAtLinks, walkableLinks.map(v => v.link));
            let addedBuff = false, leftBuf = '';
            for (const v of walkableLinks) {
                const nextWord = linking.wordsDict[v.word];
                if(indices[v.word] <= v.ix) {
                    const buf = walk(nextWord, v.ix, depth+1);

                    addedBuff = addedBuff || Boolean(buf);

                    leftBuf += buf;
                    indices[v.word]++;
                }
            }
            removeAll(lookingAtLinks, walkableLinks.map(v => v.link));

            if(addedBuff && walkableLinks.find(v => indices[v.word] > v.ix+1 && !addedLinks.has(v.link))) {
                log('!', letter.value);
                leftBuf = letter.value + leftBuf;
            }

            for(const v of letter.links) {
                addedLinks.add(v)
            }

            leftBuf += letter.value;

            log('+', `${left} + ${leftBuf}`);
            left += leftBuf;

            if(indices[wordStr] === letter.index) {
                indices[wordStr]++
            }
        }

        log('<', left + ' ' + indices[wordStr] )
        lookingAtWords.delete(word[0].word);
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

function scs(words: string[], debug = false) {
    const linking = new Linking(words);
    scoreLinks(linking);
    return walkLinks(linking, debug);
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
            }
        }
    }

    return {
        valid: invalidWords.length === 0,
        invalidWords,
    };
}


function addAll<T>(target: Set<T>, data: Iterable<T>) {
    for (const v of data) {
        target.add(v)
    }
}

function removeAll<T>(target: Set<T>, data: Iterable<T>) {
    for (const v of data) {
        target.delete(v)
    }
}



export {
    scs,
    validate,
}
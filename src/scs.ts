import {prepareLCS} from "./lcs.ts";

/** @internal */
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
    /** @internal */
    readonly d_id;
    /** @internal */
    readonly d_l;
    readonly a: C;
    readonly b: C;

    constructor(a: C, b: C) {
        if (a.word === b.word) {
            throw new Error(`Invalid link between same word ${a.word}`);
        }
        // only used in debugging
        DEBUG: {
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
    /** @internal */
    words: C[][] = [];
    /** @internal */
    wordsDict: Record<string, C[]> = {};

    addWord(word: string) {
        // adding the same word twice means nothing
        if(this.wordsDict[word]) {
            return false;
        }

        const wordChars: C[] = [];
        for(let i = 0; i < word.length; i++) {
            wordChars.push(new C(i, word));
        }

        for(let existingWord of this.words) {
            this.createLinksForLCS(existingWord, wordChars);
        }

        this.wordsDict[word] = wordChars;
        this.words.push(wordChars);

        return true;
    }


    /**
     * walks the longest common supersequence of two strings and creates links between the letters
     * @internal
     */
    private createLinksForLCS(str1: C[], str2: C[]) {
        const {lcs, n, m} = prepareLCS(str1[0].word, str2[0].word);
        let x = 0, y = 0;
        for (let c of lcs) {
            while (x < n && str1[x].value !== c) x++;
            while (y < m && str2[y].value !== c) y++;

            new Link(str1[x], str2[y]);
            x++;
            y++;
        }
    }
}


function createLinks(words: string[]) {
    const linking = new Linking();
    for(const word of words) {
        linking.addWord(word);
    }
    return linking;
}

function walkLinks(linking: Linking, options: {
    debug?: boolean;
    profile?: boolean;
} = {}) {
    let {debug} = options;

    const indices = {};
    const lookingAtLinks = new Set<Link>();
    const lookingAtWords = new Set<string>();

    const walk = (letters: C[], toIndex: number, depth = 0) => {
        const word = letters[0].word;


        let log: (symbol: string, ...args: any[]) => any;
        DEBUG: {
            log = (symbol: string, ...args: any[]) => {
                console.log(Array(depth).fill('|  ').join('')+symbol, ...args);
            }
        }

        // already set to process this letter, skip its value
        if(toIndex === indices[word]) {
            DEBUG: debug && log('/', word, 'to', (letters[toIndex]?.value || '+'), indices[word], '-', toIndex)
            return '';
        }

        DEBUG: debug && log('>', word, 'to', (letters[toIndex]?.value || 'END'), indices[word], '-', toIndex)
        DEBUG: debug && log('i', Object.entries(indices).map(v => `${v[0]}:${v[1]}`).join(', '));

        lookingAtWords.add(word);

        let left = '';
        while(indices[word] < toIndex) {
            const letter = letters[indices[word]];

            const walkableLinks = letter.links
                .map(v => ({
                    // get the opposite letter from the current word
                    char: v.opposingSide(word),
                    link: v,
                }))
                .filter(v =>
                    // dont allow cycles on this word
                    !lookingAtWords.has(v.char.word) &&
                    // don't allow us to use a link already being processed in the calls stack, UNLESS the index we want
                    // is smaller than the index we are at for that word.
                    !lookingAtLinks.values().find(l => l.isForWord(v.char.word) && l.indexRel(v.char.word) < indices[v.char.word])
                )

            for(const v of walkableLinks) {
                lookingAtLinks.add(v.link);
            }
            let leftBuf = '';
            for (const v of walkableLinks) {
                const nextWord = linking.wordsDict[v.char.word];
                // important to check this here because as we walk we these indexes update
                if(indices[v.char.word] <= v.char.index) {
                    const buf = walk(nextWord, v.char.index, depth+1);

                    leftBuf += buf;
                    indices[v.char.word]++;
                }
            }
            for(const v of walkableLinks) {
                lookingAtLinks.delete(v.link);
            }

            // check if our buffer passed our character on this word, if it did we need to prepend the char to the leftBuf
            // In this case the letter is going to be duplicated
            if(leftBuf && walkableLinks.find(v => indices[v.char.word] > v.char.index+1)) {
                DEBUG: debug && log('!', letter.value);
                leftBuf = letter.value + leftBuf;
            }
            leftBuf += letter.value;

            DEBUG: debug && log('+', `${left} + ${leftBuf}`);
            // this character is now processed, we can move to the next one
            left += leftBuf;

            // we should only increment the indices if THIS letter was the one that was processed.
            // In some cases links can fast-forward our indices during a walk, if that happens we got double processed
            if(indices[word] === letter.index) {
                indices[word]++
            }
        }

        DEBUG: debug && log('<', left + ' ' + indices[word] )
        lookingAtWords.delete(word);
        return left;
    }

    // seed our indices and walk each word.
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
    const linking = createLinks(words);
    options.profile && console.timeEnd('linking');

    options.profile && console.time('walk');
    const result = walkLinks(linking, options);
    options.profile && console.timeEnd('walk');

    options.profile && console.timeEnd('total');
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
    createLinks,
    walkLinks,
    validate,
}
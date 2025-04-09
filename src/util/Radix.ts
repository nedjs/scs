/**
 * Converts numbers to and from Radix64
 * "inspired" by https://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript#answer-6573119
 * but converted to use number and made into typescript.
 */
export class Radix {

    private readonly _rixits: string
    private readonly _rixsize: bigint;

    public constructor(
        _rixits: string
    ) {
        this._rixits = _rixits;
        this._rixsize = BigInt(this._rixits.length)
        if(!this._rixits || this._rixits.length < 2) {
            throw new Error('Radix must have at least 2 parts to operate.')
        }
    }

    get base() {
        return this._rixits.length;
    }

    /**
     * Converts a number to a radix 64 string
     *
     * Throws an error if the number is not a positive integer
     * @param number
     */
    fromNumber(number: bigint | number | string): string {
        if(typeof number === 'string') number = BigInt(number);
        if(typeof number === 'number') number = BigInt(number);

        if (number < BigInt(0))
            throw "Can't represent negative numbers using Radix64";

        let rixit: number;
        let residual: bigint = number;
        let result = '';
        while (true) {
            rixit = Number(residual % this._rixsize)
            result = this._rixits.charAt(rixit) + result;
            residual = residual / this._rixsize;

            if (residual == BigInt(0))
                break;
        }
        return result;
    }

    /**
     * Converts a radix 64 string to a number.
     *
     * Throws an error if the string contains invalid characters
     * @param rixits
     */
    toNumber(rixits: string): bigint {
        let result = BigInt(0);
        for (let e = 0; e < rixits.length; e++) {
            const ix = this._rixits.indexOf(rixits[e]);
            if(ix === -1) {
                throw new Error('Error at index ' + e + ' invalid character "'+rixits[e]+'"')
            }
            result = (result * this._rixsize) + BigInt(ix);
        }
        return result;
    }

    /**
     * Generates a unique id consisting of {fromNumber(now())}-{fromNumber(random(randomLength))}
     * If randomLength = 0 then no right hand will be appended
     * @param addlLength
     */
    timestampId(addlLength = 0) {
        let leftSide = this.fromNumber(Date.now());
        if(addlLength > 0) {
            return leftSide+'-'+this.random(addlLength);
        } else {
            return leftSide;
        }
    }

    /**
     * Generates a random number with {length} characters long.
     * The underlying numberwill be radixSize^length in size.
     * EG: radix10.random(2) would be a number between 0-99 (10^2)
     * @param length
     */
    random(length: number) {
        let buffer = '';
        for(let i=0;i<length;i++) {
            buffer += this._rixits[Math.floor(Math.random() * this._rixits.length)]
        }
        return buffer;
    }
}
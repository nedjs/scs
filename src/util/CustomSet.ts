/**
 * A set with a bunch of methods I want to use on it that arent inside the normal prototyping
 */
export class CustomSet<T> extends Set<T> {
    find(callback: (value: T) => any): T | undefined {
        for (const value of this) {
            if (callback(value)) {
                return value;
            }
        }
        return undefined;
    }
}
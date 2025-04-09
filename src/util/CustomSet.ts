/**
 * A set with a bunch of methods I want to use on it that arent inside the normal prototyping
 */
export class CustomSet<T> extends Set<T> {
    addAll(data: Iterable<T>) {
        for (const v of data) {
            this.add(v);
        }
    }

    deleteAll(data: Iterable<T>) {
        for (const v of data) {
            this.delete(v);
        }
    }

    filter(callback: (value: T) => any): CustomSet<T> {
        const result = new CustomSet<T>();
        for (const value of this) {
            if (callback(value)) {
                result.add(value);
            }
        }
        return result;
    }

    find(callback: (value: T) => any): T | undefined {
        for (const value of this) {
            if (callback(value)) {
                return value;
            }
        }
        return undefined;
    }

    map<U>(callback: (value: T) => U): CustomSet<U> {
        const result = new CustomSet<U>();
        for (const value of this) {
            result.add(callback(value));
        }
        return result;
    }
}
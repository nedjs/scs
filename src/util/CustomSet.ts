/**
 * A set with a bunch of methods I want to use on it that arent inside the normal prototyping
 */
export class CustomSet<T> extends Set<T> {

    clone() {
        return new CustomSet<T>(this);
    }

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

    any(callback: (value: T) => any): boolean {
        for (const value of this) {
            if (callback(value)) {
                return true;
            }
        }
        return false;
    }

    all(callback: (value: T) => any): boolean {
        for (const value of this) {
            if (!callback(value)) {
                return false;
            }
        }
        return true;
    }

    groupBy<K, U = T>(keyFn: (value: T) => K, valueFn?: (value: T) => U): Map<K, CustomSet<U>> {
        const result = new Map<K, CustomSet<U>>();
        for (const value of this) {
            const key = keyFn(value);
            if (!result.has(key)) {
                result.set(key, new CustomSet<U>());
            }
            result.get(key)?.add((valueFn ? valueFn(value) : value) as any);
        }
        return result;
    }

    distinctBy(callback: (value: T) => any): CustomSet<T> {
        const result = new CustomSet<T>();
        const seen = new Set<any>();
        for (const value of this) {
            const key = callback(value);
            if (!seen.has(key)) {
                seen.add(key);
                result.add(value);
            }
        }
        return result;
    }

    duplicatesBy(callback: (value: T) => any): CustomSet<T> {
        const result = new CustomSet<T>();
        const seen = new Set<any>();
        for (const value of this) {
            const key = callback(value);
            if (!seen.has(key)) {
                seen.add(key);
            } else {
                result.add(value);
            }
        }
        return result;
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

    toArray(): T[] {
        return [...this];
    }

    map<U>(callback: (value: T) => U): CustomSet<U> {
        const result = new CustomSet<U>();
        for (const value of this) {
            result.add(callback(value));
        }
        return result;
    }

    flatMap<U>(callback: (value: T) => Iterable<U>): CustomSet<U> {
        const result = new CustomSet<U>();
        for (const value of this) {
            result.addAll(callback(value));
        }
        return result;
    }
}
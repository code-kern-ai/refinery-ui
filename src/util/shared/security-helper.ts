/**
 * Escapes special characters in a string for use in a regular expression.
 * This prevents Regular Expression Denial of Service (ReDoS) and other injection attacks.
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safely creates a RegExp object from a user-provided string.
 */
export function safeRegExp(pattern: string, flags?: string): RegExp {
    return new RegExp(escapeRegExp(pattern), flags);
}

/**
 * Safely access a property of an object, preventing prototype pollution.
 */
export function safeAccess(obj: any, key: string | number): any {
    if (typeof key === 'string' && (key === '__proto__' || key === 'constructor' || key === 'prototype')) {
        throw new Error(`Unsafe key rejected: ${key}`);
    }
    return obj ? obj[key] : undefined;
}

/**
 * Safely set a property on an object, preventing prototype pollution.
 */
export function safeSet(obj: any, key: string | number, value: any): void {
    if (typeof key === 'string' && (key === '__proto__' || key === 'constructor' || key === 'prototype')) {
        throw new Error(`Unsafe key rejected: ${key}`);
    }
    if (obj) {
        obj[key] = value;
    }
}

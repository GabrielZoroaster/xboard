
export function IS_EMPTY(value){
	return value === null || value === undefined;
}

export function IS_INTEGER(value){
	return Number.isSafeInteger(value);
}

export function IS_STRING(value){
	return typeof value === 'string';
}

export function IS_OBJECT(value){
	return value && typeof value === 'object';
}

export function IS_ITERABLE(value){
	return value && (typeof value[Symbol.iterator] === 'function');
}

export function IS_ARRAY(value){
	return Array.isArray(value);
}
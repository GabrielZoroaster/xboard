
export {TagMap}

import {IS_OBJECT, IS_ITERABLE} from './types.js'
import {INVALID_META_TAGS, INVALID_META_TAG, INVALID_META_VALUE} from './errors.js'

function KEY(keyArg){
	const key = String(keyArg);
	if(/^[a-z0-9_]+$/i.test(key))
		return key;
	throw INVALID_META_TAG(key);
}

function VALUE(valueArg){
	const value = String(valueArg);
	if(value.includes('"'))
		throw INVALID_META_VALUE(value);
	return value;
}

class TagMap extends Map {

	static from(tags){
		if(IS_ITERABLE(tags))
			return new TagMap(tags);
		if(IS_OBJECT(tags))
			return new TagMap(Object.entries(tags));
		throw INVALID_META_TAGS(tags);
	}

	toString(){
		return this.toPGN();
	}

	toPGN(){
		const pgn = [];
		for(const [key, value] of this)
			pgn.push(`[${key} "${value}"]\n`);
		return pgn.join('');
	}

	get(name){
		return super.get(String(name));
	}

	has(name){
		return super.has(String(name));
	}

	set(name, value){
		return super.set(KEY(name), VALUE(value));
	}

	setAll(tags){
		for(const [key, value] of Object.entries(tags))
			this.set(key, value);
	}

	delete(name){
		return super.delete(String(name));
	}
}

export {ColorSet}

import {Color, white, black} from './color.js'
import {INVALID_COLOR_OR_COLOR_LIST, INVALID_COLOR} from './errors.js'

function ColorsFrom(colors){
	try {
		return [... colors];
	} catch {
		throw INVALID_COLOR_OR_COLOR_LIST(colors);
	}
}

class ColorSetState {

	static fromList(colors){
		let state = EMPTY;
		for(const color of ColorsFrom(colors)){
			if(Color.isWhite(color))
				state = state.addWhite();
			else if(Color.isBlack(color))
				state = state.addBlack();
			else throw INVALID_COLOR_OR_COLOR_LIST(value);
		}	return state;
	}

	static from(value){
		if(value === undefined)
			return EMPTY;
		if(value === null)
			return EMPTY;
		if(Color.isWhite(value))
			return WHITE;
		if(Color.isBlack(value))
			return BLACK;
		return this.fromList(value);
	}

	get size(){
		return 0;
	}

	* all(){
		// do nothing
	}

	hasWhite(){
		return false;
	}

	hasBlack(){
		return false;
	}

	addWhite(){
		return this;
	}

	addBlack(){
		return this;
	}

	deleteWhite(){
		return this;
	}

	deleteBlack(){
		return this;
	}

	toggleWhite(){
		// abstract
	}

	toggleBlack(){
		// abstract
	}

	add(value){
		if(Color.isWhite(value))
			return this.addWhite();
		if(Color.isBlack(value))
			return this.addBlack();
		INVALID_COLOR(value);
	}

	delete(value){
		if(Color.isWhite(value))
			return this.deleteWhite();
		if(Color.isBlack(value))
			return this.deleteBlack();
		INVALID_COLOR(value);
	}

	toggle(value){
		if(Color.isWhite(value))
			return this.toggleWhite();
		if(Color.isBlack(value))
			return this.toggleBlack();
		INVALID_COLOR(value);
	}

	has(value){
		if(Color.isWhite(value))
			return this.hasWhite();
		if(Color.isBlack(value))
			return this.hasBlack();
		return false;
	}
}

class FullState extends ColorSetState {

	get size(){
		return 2;
	}

	* all(){
		yield white;
		yield black;
	}

	hasWhite(){
		return true;
	}

	hasBlack(){
		return true;
	}

	deleteWhite(){
		return BLACK;
	}

	deleteBlack(){
		return WHITE;
	}

	toggleWhite(){
		return BLACK;
	}

	toggleBlack(){
		return WHITE;
	}
}

class WhiteState extends ColorSetState {

	get size(){
		return 1;
	}

	* all(){
		yield white;
	}

	hasWhite(){
		return true;
	}

	addBlack(){
		return FULL;
	}

	deleteWhite(){
		return EMPTY;
	}

	toggleWhite(){
		return EMPTY;
	}

	toggleBlack(){
		return FULL;
	}
}

class BlackState extends ColorSetState {

	get size(){
		return 1;
	}

	* all(){
		yield black;
	}

	hasBlack(){
		return true;
	}

	addWhite(){
		return FULL;
	}

	deleteBlack(){
		return EMPTY;
	}

	toggleWhite(){
		return FULL;
	}

	toggleBlack(){
		return EMPTY;
	}
}

class EmptyState extends ColorSetState {

	addWhite(){
		return WHITE;
	}

	addBlack(){
		return BLACK;
	}

	toggleWhite(){
		return WHITE;
	}

	toggleBlack(){
		return BLACK;
	}
}

const FULL = new FullState();
const WHITE = new WhiteState();
const BLACK = new BlackState();
const EMPTY = new EmptyState();

class ColorSet {

	#state;

	constructor(value){
		this.#state = this.#from(value);
	}

	#update(state){
		if(this.#state !== state){
			this.#state = state;
			this.onChange();
		}
	}

	#from(colors){
		try {
			return colors.#state;
		} catch {
			return ColorSetState.from(colors);
		}
	}

	get size(){
		return this.#state.size;
	}

	setAll(colors){
		this.#update(this.#from(colors));
	}

	add(value){
		this.#update(this.#state.add(value));
	}

	delete(value){
		this.#update(this.#state.delete(value));
	}

	toggle(value){
		this.#update(this.#state.toggle(value));
	}

	has(value){
		return this.#state.has(value);
	}

	clear(){
		this.#update(EMPTY);
	}

	addWhite(){
		this.#update(this.#state.addWhite());
	}

	addBlack(){
		this.#update(this.#state.addBlack());
	}

	deleteWhite(){
		this.#update(this.#state.deleteWhite());
	}

	deleteBlack(){
		this.#update(this.#state.deleteBlack());
	}

	toggleWhite(){
		this.#update(this.#state.toggleWhite());
	}

	toggleBlack(){
		this.#update(this.#state.toggleBlack());
	}

	hasWhite(){
		return this.#state.hasWhite();
	}

	hasBlack(){
		return this.#state.hasBlack();
	}

	[Symbol.iterator](){
		return this.#state.all();
	}

	toArray(){
		return [... this];
	}

	toJSON(){
		return [... this].map(color => color.toJSON());
	}

	keys(){
		return this.#state.all();
	}

	values(){
		return this.#state.all();
	}

	* entries(){
		for(const color of this.#state.all())
			yield [color, color];
	}

	forEach(cb, thisArg){
		for(const color of this.#state.all())
			cb.call(thisArg, color, color, this);
	}

	onChange(){
		// on change
	}
}
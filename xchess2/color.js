
export {
	white,
	black,
	white as w,
	black as b,
	Color,
}

import {IS_STRING} from './types.js'
import {INVALID_COLOR} from './errors.js'

function color(value){
	if(IS_STRING(value))
		value = value.toLowerCase();
	const color = map.get(value);
	if(color)
		return color;
	throw INVALID_COLOR(value);
}

function is(value){
	if(IS_STRING(value))
		return map.has(value.toLowerCase());
	return map.has(value);
}

function rand(){
	return colors[Math.floor(Math.random() * colors.length)];
}

class Color {

	static from(value){
		return color(value);
	}

	static invert(value){
		return color(value).invert();
	}

	static rand(){
		return rand();
	}

	static all(){
		return colors;
	}

	static get white(){
		return white;
	}

	static get black(){
		return black;
	}

	static get w(){
		return white;
	}

	static get b(){
		return black;
	}

	static is(value){
		return is(value);
	}

	static isWhite(value){
		return WhiteTest(value);
	}

	static isBlack(value){
		return BlackTest(value);
	}

	get code(){
		return NaN;
	}

	get char(){
		return '?';
	}

	get name(){
		return 'unknown';
	}

	get fen(){
		return this.char;
	}

	get isWhite(){
		return false;
	}

	get isBlack(){
		return false;
	}

	invert(){
		return null;
	}

	valueOf(){
		return this.code;
	}

	toString(){
		return this.name;
	}

	toJSON(){
		return this.name;
	}

	eq(colorArg){
		return null;
	}

	opposite(color){
		return null;
	}

	// Rule

	get moveDir(){
		return null;
	}

	relRank(square){
		return null;
	}
}

class White extends Color {

	get code(){
		return 0;
	}

	get char(){
		return 'w';
	}

	get name(){
		return 'white';
	}

	get isWhite(){
		return true;
	}

	invert(){
		return black;
	}

	eq(color){
		return WhiteTest(color);
	}

	opposite(color){
		return BlackTest(color);
	}

	// Rule

	get moveDir(){
		return -1;
	}

	relRank(square){
		return square.board.height - square.y;
	}
}

class Black extends Color {

	get code(){
		return 1;
	}

	get char(){
		return 'b';
	}

	get name(){
		return 'black';
	}

	get isBlack(){
		return true;
	}

	invert(){
		return white;
	}

	eq(color){
		return BlackTest(color);
	}

	opposite(color){
		return WhiteTest(color);
	}

	// Rule

	get moveDir(){
		return 1;
	}

	relRank(square){
		return square.y + 1;
	}
}

const white = new White();
const black = new Black();
const colors = [white, black];
const map = new Map();

Object.freeze(colors);

for(const color of colors){
	map.set(color, color);
	map.set(color.code, color);
	map.set(color.char, color);
	map.set(color.name, color);
}

function CreateColorTest(color){
	const set = new Set();
	set.add(color);
	set.add(color.code);
	set.add(color.char);
	set.add(color.name);
	return function(value){
		if(IS_STRING(value))
			return set.has(value.toLowerCase())
		return set.has(value);
	}
}

const WhiteTest = CreateColorTest(white);
const BlackTest = CreateColorTest(black);
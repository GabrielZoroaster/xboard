
export {Bestiary}

import {Color} from './color.js'
import {Piece} from './piece.js'
import {King, Queen, Rook, Bishop, Knight, Pawn} from './piece.chess.js'
import * as fairy from './piece.fairy.js'
import {IS_STRING, IS_OBJECT, IS_ITERABLE} from './types.js'
import {
	INVALID_PIECE_TYPE,
	UNKNOWN_PIECE_TYPE_ID,
	INVALID_PIECE_TYPE_ID,
	DUPLICATE_PIECE_TYPE_ID,
	INVALID_PIECE_FEN,
	EMPTY_PIECE_FEN,
	UNSUPPORTED_PIECE_TYPE,
	INVALID_PIECE_COLOR,
} from './errors.js'

const BuiltinRegistry = new Map();

function TestFEN(fen){
	if(!IS_STRING(fen))
		throw INVALID_PIECE_FEN(fen);
	if(fen.length < 1)
		throw EMPTY_PIECE_FEN();
	return fen;
}

function Register(id, value){
	BuiltinRegistry.set(id, value);
}

function RegisterBestiary(id, ... types){
	const bestiary = new Bestiary(... types);
	Register(id, bestiary);
	for(const type of bestiary)
		Register(type.id, type);
	return bestiary;
}

class Bestiary {

	static is(value){
		return value instanceof this;
	}

	static from(value){
		if(this.is(value))
			return value;
		if(IS_STRING(value)){
			const types = BuiltinRegistry.get(value);
			if(types) return this.from(types);
			throw UNKNOWN_PIECE_TYPE_ID(value);
		}	return new this(value);
	}

	#map = new Map();
	#colorMap = new Map();
	#types = new Set();
	#all;
	#promotes;

	constructor(... types){
		this.#Iterator(types);
		this.#all = [... this.#types];
		this.#promotes = Object.freeze([... this.#all.filter(type => type.isPromotable)]);
	}

	#Iterator(iterator){
		for(const type of iterator)
			this.#add(type);
	}

	#add(value){
		if(IS_STRING(value))
			this.#ID(value);
		else if(Bestiary.is(value))
			this.#Bestiary(value);
		else if(Piece.isPrototypeOf(value))
			this.#Type(value);
		else if(IS_ITERABLE(value))
			this.#Iterator(value);
		else throw INVALID_PIECE_TYPE(value);
	}

	#ID(typeID){
		const value = BuiltinRegistry.get(typeID);
		if(value) this.#add(value);
		else throw UNKNOWN_PIECE_TYPE_ID(typeID);
	}

	#Bestiary(bestiary){
		for(const type of bestiary)
			this.#Type(type);
	}

	#Type(type){
		this.#setID(type.id, type);
		this.#setID(type.code, type);
		this.#setID(type.moveLetter, type);
		this.#setWhiteFEN(type.whiteFen, type);
		this.#setBlackFEN(type.blackFen, type);
		this.#types.add(type);
	}

	#setID(id, type){
		const prev = this.#map.get(id);
		if(prev && (prev !== type))
			throw DUPLICATE_PIECE_TYPE_ID(id);
		this.#map.set(id, type);
	}

	#setColorID(id, color, type){
		const prev = this.#colorMap.get(id);
		if(prev && (prev !== type))
			throw DUPLICATE_PIECE_TYPE_ID(id);
		this.#colorMap.set(id, {color, type});
		this.#types.add(type);
	}

	#setWhiteID(id, type){
		this.#setColorID(id, Color.white, type);
	}

	#setBlackID(id, type){
		this.#setColorID(id, Color.black, type);
	}

	#setWhiteFEN(fen, type){
		TestFEN(fen);
		this.#setWhiteID(fen, type);
	}

	#setBlackFEN(fen, type){
		TestFEN(fen);
		this.#setBlackID(fen, type);
	}

	[Symbol.iterator](){
		return this.#types.values();
	}

	get size(){
		return this.#types.size;
	}

	has(type){
		return this.#types.has(type);
	}

	#supports(piece){
		return this.has(piece.constructor);
	}

	promotes(){
		return this.#promotes;
	}

	supports(piece){
		return Piece.is(piece) && this.#supports(piece);
	}

	from(value, color){
		if(Piece.is(value)){
			if(!this.#supports(value))
				throw UNSUPPORTED_PIECE_TYPE(value.constructor.name);
			if(color){
				const pieceColor = Color.from(color);
				if(value.color !== pieceColor)
					throw INVALID_PIECE_COLOR(pieceColor);
			}	return value;
		}
		if(color){
			const type = this.#map.get(value);
			if(type) return new type(color);
			throw INVALID_PIECE_TYPE_ID(value);
		}
		const typeEntry = this.#colorMap.get(value);
		if(typeEntry){
			const {color, type} = typeEntry;
			return new type(color);
		}	throw INVALID_PIECE_TYPE_ID(value);
	}

	rand(color = Color.rand()){
		if(this.#all.length > 0){
			const type = this.#all[Math.floor(Math.random() * this.#all.length)];
			return new type(color);
		} return null;
	}

	debug(){
		return [this.#map, this.#colorMap];
	}
}

export const chess = RegisterBestiary('chess', King, Queen, Rook, Bishop, Knight, Pawn);
RegisterBestiary('fairy', ... Object.values(fairy));
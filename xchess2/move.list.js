
import {INVALID_MOVE, MOVE_NOT_FOUND, AMBIGUOUS_MOVE} from './errors.js'
import {DisambiguateMoves} from './move.disambiguation.js'
import {ParseMove} from './move.parser.js'
import {IS_STRING, IS_OBJECT, IS_INTEGER} from './types.js'

export class MoveList {

	#game;
	#moves;
	#moveList;

	constructor(game, ... moves){
		this.#game = game;
		this.#moves = new Set(moves);
		DisambiguateMoves(this.#moves);
	}

	get game(){
		return this.#game;
	}

	[Symbol.iterator](){
		return this.#moves.values();
	}

	get size(){
		return this.#moves.size;
	}

	rand(query){
		const moves = this.search(query);
		if(moves.length > 0)
			return moves[Math.floor(Math.random() * moves.length)];
		return null;
	}

	* #match(query){
		for(const move of this)
			if(move.match(query))
				yield move;
	}

	* #byCode(code){
		for(const move of this)
			if(move.code === code)
				yield move;
	}

	#search(query){
		if(query === undefined)
			return this;
		if(IS_STRING(query))
			return this.#match(this.parse(query));
		if(IS_OBJECT(query))
			return this.#match(query);
		if(IS_INTEGER(query))
			return this.#byCode(query);
		throw INVALID_MOVE(query);
	}

	#has(query){
		for(const move of this)
			if(move.match(query))
				return true;
		return false;
	}

	#hasCode(code){
		for(const move of this)
			if(move.code === code)
				return true;
		return false;
	}

	parse(query){
		return ParseMove(String(query), this.game);
	}

	has(query){
		if(this.#moves.has(query))
			return true;
		if(IS_STRING(query))
			return this.#has(this.parse(query));
		if(IS_OBJECT(query))
			return this.#has(query);
		if(IS_INTEGER(query))
			return this.#hasCode(query);
		return false;
	}

	of(piece){
		const moves = [];
		for(const move of this)
			if(move.piece === piece)
				moves.push(move);
		return moves;
	}

	search(query){
		if(this.#moves.has(query))
			return [query];
		return [... this.#search(query)];
	}

	resolve(query){
		if(this.#moves.has(query))
			return query;
		const moves = [... this.#search(query)];
		if(moves.length > 1)
			throw AMBIGUOUS_MOVE(query);
		if(moves.length < 1)
			throw MOVE_NOT_FOUND(query);
		return moves[0];
	}

	toArray(){
		return [... this];
	}

	text(query){
		const squares = new Map();
		for(const move of this.search(query)){
			if(move.to){
				const count = squares.get(move.to);
				if(count > 0) squares.set(move.to, count + 1);
				else squares.set(move.to, 1);
			}
		}
		return this.game.board.text(square => {
			const count = squares.get(square);
			if(count > 0) return String(count);
		});
	}
}
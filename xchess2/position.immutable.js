
import {Position} from './position.js'
import {IS_STRING, IS_OBJECT, IS_ITERABLE} from './types.js'
import {FenToPosition} from './fen.js'
import {INVALID_POSITION} from './errors.js'
import {MutablePosition} from './position.mutable.js'

export class ImmutablePosition extends Position {

	#squares;

	constructor(game, position = []){
		super(game);
		this.#setAll(position);
	}

	#setAll(position){
		if(IS_STRING(position))
			this.#setAsFen(position);
		else if(Position.is(position))
			this.#setAsPosition(position);
		else if(IS_ITERABLE(position))
			this.#setAsMap(position);
		else if(IS_OBJECT(position))
			this.#setAsObject(position);
		else throw INVALID_POSITION(position);
	}

	#setAsFen(fen){
		this.#squares = FenToPosition(this.game, fen);
	}

	#setAsPosition(position){
		this.#squares = new Map();
		for(const [square, piece] of position)
			this.#squares.set(square, this.bestiary.from(piece));
	}

	#setAsMap(map){
		const squares = new Map();
		const pieces = new Map();
		for(const [squareArg, pieceArg] of map){
			const square = this.board.req(squareArg);
			const piece = this.bestiary.from(pieceArg);
			const oldSquare = pieces.get(piece);
			if(oldSquare) squares.delete(oldSquare);
			pieces.set(piece, square);
			squares.set(square, this.bestiary.from(piece));
		}	this.#squares = squares;
	}

	#setAsObject(object){
		this.#setAsMap(Object.entries(object));
	}

	// Read

	get size(){
		return this.#squares.size;
	}

	at(x, y){
		return this.#squares.get(this.board.at(x, y));
	}

	get(square){
		return this.#squares.get(this.board.req(square));
	}

	has(square){
		return this.#squares.has(this.board.req(square));
	}

	find(value){
		for(const [square, piece] of this)
			if(value === piece)
				return square;
		return null;
	}

	contains(piece){
		for(const piece of this.values())
			if(value === piece)
				return true;
		return false;
	}

	keys(){
		return this.#squares.keys();
	}

	values(){
		return this.#squares.values();
	}

	entries(){
		return this.#squares.entries();
	}

	// Clone

	clone(){
		return new MutablePosition(this.game, this.#squares);
	}

	freeze(){
		return this;
	}
}
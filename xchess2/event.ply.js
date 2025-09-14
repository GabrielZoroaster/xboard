
export {PlyState}

import {Next} from './game.js'
import {GameState} from './event.state.js'
import {StateToHash} from './hash.js'
import {MoveList} from './move.list.js'

class PlyState extends GameState {

	#position;
	#color;
	#castling;
	#enPassant;
	#fullmoveNumber;
	#halfmoveClock;
	#moves;
	#checkSquares;
	#isCheck;
	#repetitionCount;
	#isDeadPosition;
	#hash;
	#result;

	constructor(game, prev, prevID, result, {
		position,
		color,
		castling,
		enPassant,
		fullmoveNumber,
		halfmoveClock,
	}){
		super(game, prev, prevID);
		this.#result = result;
		this.#position = position;
		this.#color = color;
		this.#castling = castling;
		this.#enPassant = enPassant;
		this.#fullmoveNumber = fullmoveNumber;
		this.#halfmoveClock = halfmoveClock;
	}

	evaluate(){
		this.#moves = new MoveList(this.game, ... this.game.rules.moves(this));
		this.#checkSquares = Object.freeze([... this.game.rules.checkSquares(this)]);
		this.#isCheck = this.checkSquares.length > 0;
		this.#hash = StateToHash(this);
		this.#repetitionCount = this.game.rules.repetitionCount(this);
		this.#isDeadPosition = this.game.rules.isDeadPosition(this.position);
		this.#result = this.game.rules.result(this);
	}

	// Event

	get ply(){
		return this;
	}

	get result(){
		return this.#result;
	}

	get next(){
		return Next.get(this) ?? null;
	}

	get result(){
		return this.#result;
	}

	// Stats

	get isPly(){
		return true;
	}

	get canMove(){
		return true;
	}

	get canMeta(){
		return true;
	}

	// State

	get position(){
		return this.#position;
	}

	get color(){
		return this.#color;
	}

	get castling(){
		return this.#castling;
	}

	get enPassant(){
		return this.#enPassant;
	}

	get fullmoveNumber(){
		return this.#fullmoveNumber;
	}

	get halfmoveClock(){
		return this.#halfmoveClock;
	}

	get moves(){
		return this.#moves;
	}

	get checkSquares(){
		return this.#checkSquares;
	}

	get isCheck(){
		return this.#isCheck;
	}

	get repetitionCount(){
		return this.#repetitionCount;
	}

	get isDeadPosition(){
		return this.#isDeadPosition;
	}

	get hash(){
		return this.#hash;
	}

	get isIrreversible(){
		return false;
	}
}
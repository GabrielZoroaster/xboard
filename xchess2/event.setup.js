
import {GameState} from './event.state.js'
import {NoResult} from './result.js'
import {Color} from './color.js'
import {SetupPosition} from './position.mutable.js'
import {SetupCastling} from './castling.js'
import {FenToState, StateToFen} from './fen.js'
import {INVALID_HALFMOVE_CLOCK, INVALID_FULLMOVE_NUMBER} from './errors.js'

function EnPassant(game, value){
	if(value === null)
		return null;
	return game.board.req(value);
}

function HalfmoveClock(value){
	if(!Number.isSafeInteger(value))
		throw INVALID_HALFMOVE_CLOCK(value);
	if(value < 0)
		throw INVALID_HALFMOVE_CLOCK(value);
	return value;
}

function FullmoveNumber(value){
	if(!Number.isSafeInteger(value))
		throw INVALID_FULLMOVE_NUMBER(value);
	if(value < 1)
		throw INVALID_FULLMOVE_NUMBER(value);
	return value;
}

export class SetupState extends GameState {

	static from(game, config){
		const state = new this(game);
		state.#setConfig(config);
		return state;
	}

	static fromFen(game, fen){
		const state = new this(game);
		state.#setFEN(fen);
		return state;
	}

	#result = new NoResult();
	#position;
	#color;
	#castling;
	#enPassant;
	#fullmoveNumber;
	#halfmoveClock;

	constructor(game){
		super(game, null, 0);
	}

	#setConfig({
		position,
		color = Color.white,
		enPassant = null,
		fullmoveNumber = 1,
		halfmoveClock = 0,
		wk = true, wq = true, bk = true, bq = true,
		castling = {wk, wq, bk, bq},
	}){
		this.#color = Color.from(color);
		this.#position = new SetupPosition(this.game, position);
		this.#castling = SetupCastling.from(this.game, castling);
		this.#enPassant = EnPassant(this.game, enPassant);
		this.#fullmoveNumber = FullmoveNumber(fullmoveNumber);
		this.#halfmoveClock = HalfmoveClock(halfmoveClock);
	}

	#setFEN(fen){
		const {position, color, castling, enPassant, halfmoveClock, fullmoveNumber} = FenToState(this.game, fen);
		this.#color = color;
		this.#position = new SetupPosition(this.game, position);
		this.#castling = SetupCastling.from(this.game, castling);
		this.#enPassant = enPassant;
		this.#halfmoveClock = halfmoveClock;
		this.#fullmoveNumber = fullmoveNumber;
	}

	// Event

	get result(){
		return this.#result;
	}

	get type(){
		return 'setup';
	}

	// Stats

	get isSetup(){
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

	// Write

	#change(){
		if(this.game.isSetup)
			this.game.emit('change');
	}

	setFEN(fen){
		const {position, color, castling, enPassant, halfmoveClock, fullmoveNumber} = FenToState(this.game, fen);
		this.#castling = SetupCastling.from(this.game, castling);
		this.#color = color;
		this.#enPassant = enPassant;
		this.#halfmoveClock = halfmoveClock;
		this.#fullmoveNumber = fullmoveNumber;
		this.position.setAll(position);
		this.#change();
	}

	setPosition(value){
		this.position.setAll(value);
	}

	setColor(value){
		const color = Color.from(value);
		if(this.color !== color){
			this.#color = color;
			this.#change();
		}
	}

	setHalfmoveClock(value){
		const halfmoveClock = HalfmoveClock(value);
		if(this.halfmoveClock !== halfmoveClock){
			this.#halfmoveClock = halfmoveClock;
			this.#change();
		}
	}

	setFullmoveNumber(value){
		const fullmoveNumber = FullmoveNumber(value);
		if(this.fullmoveNumber !== fullmoveNumber){
			this.#fullmoveNumber = fullmoveNumber;
			this.#change();
		}
	}

	setCastling(value){
		this.#castling = SetupCastling.from(this.game, value);
		this.#change();
	}

	setEnPassant(value){
		const enPassant = EnPassant(this.game, value);
		if(this.enPassant !== enPassant){
			this.#enPassant = enPassant;
			this.#change();
		}
	}

	// Prepare

	prepareCastling(){
		return this.castling.prepare(this.position);
	}

	prepareEnPassant(){
		if(this.enPassant){
			if(this.position.has(this.enPassant))
				return null;
			const pawnColor = this.color.invert();
			const pawnSquare = this.enPassant.dy(pawnColor.moveDir);
			const pawn = this.position.get(pawnSquare);
			if(pawn && pawn.isPawn && pawn.color.eq(pawnColor))
				return this.enPassant;
		}	return null;
	}
}
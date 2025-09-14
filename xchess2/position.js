
import {PositionToText} from './ascii.js'
import {PositionToFen} from './fen.js'
import {Weight, Advantage, Stats} from './position.stats.js'
import {Color} from './color.js'

export class Position {

	static is(value){
		try {
			value.#game;
			return true;
		} catch {
			return false;
		}
	}

	#game;

	constructor(game, position){
		this.#game = game;
	}

	get game(){
		return this.#game;
	}

	get board(){
		return this.#game.board;
	}

	get bestiary(){
		return this.#game.bestiary;
	}

	// Read

	get size(){
		// abstract
	}

	at(x, y){
		// abstract
	}

	get(square){
		// abstract
	}

	has(square){
		// abstract
	}

	find(piece){
		// abstract
	}

	contains(piece){
		// abstract
	}

	keys(){
		// abstract
	}

	values(){
		// abstract
	}

	entries(){
		// abstract
	}

	byColor(color){
		return this.#byColor(Color.from(color));
	}

	whites(){
		return this.#byColor(Color.white);
	}

	blacks(){
		return this.#byColor(Color.black);
	}

	* #byColor(color){
		for(const piece of this.values())
			if(piece.color === color)
				yield piece;
	}

	forEach(cb, thisArg){
		for(const [square, piece] of this)
			cb.call(thisArg, piece, square, this);
	}

	[Symbol.iterator](){
		return this.entries();
	}

	// I/O

	get fen(){
		return PositionToFen(this);
	}

	toString(){
		return this.fen;
	}

	toJSON(){
		const json = {};
		for(const [square, piece] of this)
			json[square.toString()] = piece.fen;
		return json;
	}

	text(pieceCb, emptyCb){
		return PositionToText(this, pieceCb, emptyCb);
	}

	// Clone

	clone(){
		// abstract
	}

	freeze(){
		// abstract
	}

	// Stats

	weight(){
		return Weight(this);
	}

	advantage(color){
		return Advantage(this, color);
	}

	density(){
		return this.size / this.board.size;
	}

	stats(color){
		return Stats(this, color);
	}

	// Rules

	attacks(square, piece){
		const to = this.board.req(square);
		const target = this.bestiary.from(piece);
		for(const [from, attacker] of this)
			if((target.isCapturable(attacker)) && attacker.attacks(this, from, to))
				return true;
		return false;
	}

	* moves(state){
		for(const [square, piece] of this)
			if(piece.color.eq(state.color))
				yield * piece.moves(state, square);
	}

	* checks(color){
		const defender = Color.from(color);
		for(const [square, king] of this)
			if(king.isRoyal && (king.color === defender) && this.attacks(square, king))
				yield square;
	}

	isCheck(color){
		for(const square of this.checks(color))
			return true;
		return false;
	}
}

export {GameState}

import {GameEvent} from './event.js'
import {StateToFen} from './fen.js'
import {MoveList} from './move.list.js'
import {EDIT_LOCKED} from './errors.js'
import {TraceMoves} from './position.stats.js'

class GameState extends GameEvent {

	// Event

	get state(){
		return this;
	}

	get drawOffer(){
		return null;
	}

	// Stats

	get isState(){
		return true;
	}

	get isIrreversible(){
		return false;
	}

	// State

	get fen(){
		return StateToFen(this);
	}

	get position(){
		// abstract
	}

	get color(){
		// abstract
	}

	get castling(){
		// abstract
	}

	get enPassant(){
		// abstract
	}

	get fullmoveNumber(){
		// abstract
	}

	get halfmoveClock(){
		// abstract
	}

	get lastMove(){
		return null;
	}

	get moves(){
		return new MoveList(this.game);
	}

	get checkSquares(){
		return [];
	}

	get isCheck(){
		return false;
	}

	get repetitionCount(){
		return 1;
	}

	get isDeadPisition(){
		return false;
	}

	get hash(){
		return null;
	}

	// Write

	setFEN(value){
		throw EDIT_LOCKED();
	}

	setColor(value){
		throw EDIT_LOCKED();
	}

	setPosition(value){
		throw EDIT_LOCKED();
	}

	setCastling(value){
		throw EDIT_LOCKED();
	}

	setEnPassant(value){
		throw EDIT_LOCKED();
	}

	setFullmoveNumber(value){
		throw EDIT_LOCKED();
	}

	setHalfmoveClock(value){
		throw EDIT_LOCKED();
	}

	// Events

	trigger(game){
		// abstract
	}

	// Stats

	traceMoves(square, piece){
		return TraceMoves(this, square, piece);
	}
}
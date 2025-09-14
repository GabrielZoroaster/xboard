
export {PromotionState}

import {GameState} from './event.state.js'
import {MoveList} from './move.list.js'

class PromotionState extends GameState {

	#ply;
	#result;
	#lastMove;
	#position;

	constructor(prev, position, lastMove){
		super(prev.game, prev, prev.eventID);
		this.#ply = prev.ply;
		this.#result = prev.result;
		this.#position = position;
		this.#lastMove = lastMove;
	}

	// Event

	get ply(){
		return this.#ply;
	}

	get result(){
		return this.#result;
	}

	get prev(){
		return this.#ply;
	}

	get next(){
		return this.#ply.next;
	}

	get plyID(){
		return this.#ply.plyID;
	}

	get type(){
		return 'promotion';
	}

	// Stats

	get isPromotion(){
		return true;
	}

	// State

	get lastMove(){
		return this.#lastMove;
	}

	get position(){
		return this.#position;
	}

	get color(){
		return this.#ply.color;
	}

	get castling(){
		return this.#ply.castling;
	}

	get enPassant(){
		return this.#ply.enPassant;
	}

	get fullmoveNumber(){
		return this.#ply.fullmoveNumber;
	}

	get halfmoveClock(){
		return this.#ply.halfmoveClock;
	}

	get moves(){
		return new MoveList(this.game);
	}

	get checkSquares(){
		return [];
	}

	get isCheck(){
		return null;
	}

	get repetitionCount(){
		return null;
	}

	get isDeadPisition(){
		return null;
	}

	// Events

	trigger(){
		this.game.emit('state', this);
		this.game.emit('promotion', this.lastMove.promotes);
		this.lastMove.trigger(this.game);
	}
}


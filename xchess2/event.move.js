
export {MoveState}

import {PlyState} from './event.ply.js'

class MoveState extends PlyState {

	#prev;
	#plyID;
	#lastMove;

	constructor(prev, state, lastMove){
		super(prev.game, prev, prev.eventID, prev.result, state);
		this.#prev = prev.ply;
		this.#plyID = prev.plyID + 1;
		this.#lastMove = lastMove;
		this.evaluate();
	}

	get prev(){
		return this.#prev;
	}

	get plyID(){
		return this.#plyID;
	}

	get lastMove(){
		return this.#lastMove;
	}

	get isIrreversible(){
		return this.#lastMove.isIrreversible;
	}

	get type(){
		return 'move';
	}

	toSAN(options){
		if(this.isCheckmate)
			return this.lastMove.toString(options) + '#';
		if(this.isCheck)
			return this.lastMove.toString(options) + '+';
		return this.lastMove.toString(options);
	}

	// Events

	trigger(){
		this.game.emit('state', this);
		this.game.emit('ply', this);
		this.game.emit('move', this.lastMove);
		this.lastMove.trigger(this.game);
		this.result.trigger(this.game);
		if(!this.result.isGameOver){
			if(this.halfmoveClock === 100)
				this.game.emit('50-moves');
			if(this.repetitionCount === 3)
				this.game.emit('3-repetition');
		}
	}
}
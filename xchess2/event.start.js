
export {StartState}

import {PlyState} from './event.ply.js'
import {ImmutablePosition} from './position.immutable.js'
import * as rules from './rules.js'

class StartState extends PlyState {

	constructor(setup){
		const position = new ImmutablePosition(setup.game, setup.position);
		const color = setup.color;
		const castling = setup.prepareCastling();
		const enPassant = setup.prepareEnPassant();
		const fullmoveNumber = setup.fullmoveNumber;
		const halfmoveClock = setup.halfmoveClock;
		const state = {position, color, castling, enPassant, fullmoveNumber, halfmoveClock};
		super(setup.game, null, 0, setup.result, state);
		this.evaluate();
	}

	get plyID(){
		return 0;
	}

	get isIrreversible(){
		return true;
	}

	get type(){
		return 'start';
	}

	// Events

	trigger(){
		this.game.emit('state', this);
		this.game.emit('ply', this);
		this.game.emit('play', this);
		this.result.trigger(this.game);
		if(!this.result.isGameOver){
			if(this.halfmoveClock >= 100)
				this.game.emit('50-moves');
			if(this.repetitionCount >= 3)
				this.game.emit('3-repetition');
		}
	}
}
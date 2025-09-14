
import {NextEvent} from './game.js'

export class GameEvent {

	#game;
	#prevEvent;
	#eventID;
	#time = Date.now();

	constructor(game, prev, prevID){
		this.#game = game;
		this.#prevEvent = prev;
		this.#eventID = prevID + 1;
	}

	get game(){
		return this.#game;
	}

	get time(){
		return this.#time;
	}

	get prevEvent(){
		return this.#prevEvent;
	}

	get nextEvent(){
		return NextEvent.get(this) ?? null;
	}

	get eventID(){
		return this.#eventID;
	}

	get type(){
		return 'event';
	}

	get state(){
		return null;
	}

	get ply(){
		return null;
	}

	get result(){
		return null;
	}

	get prev(){
		return null;
	}

	get next(){
		return null;
	}

	get plyID(){
		return null;
	}

	get drawOffer(){
		return this.prevEvent.drawOffer;
	}

	// Stats

	get isCurrent(){
		return this.game.current === this;
	}

	get isState(){
		return false;
	}

	get isMeta(){
		return false;
	}

	get isPly(){
		return false;
	}

	get isSetup(){
		return false;
	}

	get isPromotion(){
		return false;
	}

	get canMove(){
		return false;
	}

	get canMeta(){
		return false;
	}

	// Result

	get isGameOver(){
		return this.result.isGameOver;
	}

	get isWin(){
		return this.result.isWin;
	}

	get isDraw(){
		return this.result.isDraw;
	}

	get isCheckmate(){
		return this.result.isCheckmate;
	}

	get isStalemate(){
		return this.result.isStalemate;
	}

	get winner(){
		return this.result.winner;
	}

	get loser(){
		return this.result.loser;
	}

	// Events

	trigger(){
		// abstract
	}
}
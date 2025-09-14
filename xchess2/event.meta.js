
import {GameEvent} from './event.js'
import {resolve} from './nags.js'
import {INVALID_NAG} from './errors.js'

function Nag(value){
	const nag = resolve(value);
	if(nag) return nag;
	throw INVALID_NAG(value);
}

export class MetaEvent extends GameEvent {

	#state;
	#result;

	constructor(prev){
		super(prev.game, prev, prev.eventID);
		this.#state = prev.state;
		this.#result = prev.result;
	}

	get state(){
		return this.#state;
	}

	get ply(){
		return this.#state.ply;
	}

	get result(){
		return this.#result;
	}

	get prev(){
		return this.#state.prev;
	}

	get next(){
		return this.#state.next;
	}

	get plyID(){
		return this.#state.plyID;
	}

	// Stats

	get isMeta(){
		return true;
	}

	get canMove(){
		return true;
	}

	get canMeta(){
		return true;
	}
}

export class GameOverEvent extends MetaEvent {

	#result;

	constructor(prev, result){
		super(prev);
		this.#result = result;
	}

	get type(){
		return 'gameover';
	}

	get result(){
		return this.#result;
	}

	get drawOffer(){
		return null;
	}

	// Events

	trigger(){
		this.result.trigger(this.game);
	}
}

export class DrawOfferEvent extends MetaEvent {

	#drawOffer;

	constructor(prev, drawOffer){
		super(prev);
		this.#drawOffer = drawOffer;
	}

	get drawOffer(){
		return this.#drawOffer;
	}

	get type(){
		return 'draw-offer';
	}

	// Events

	trigger(){
		this.game.emit('draw-offer', this.drawOffer);
	}
}

export class NagEvent extends MetaEvent {

	#nag;

	constructor(prev, nag){
		super(prev);
		this.#nag = Nag(nag);
	}

	get nag(){
		return this.#nag;
	}

	get code(){
		return this.#nag.code;
	}

	get suffix(){
		return this.#nag.suffix;
	}

	get type(){
		return 'nag';
	}

	// Events

	trigger(){
		this.game.emit('nag', this.nag);
	}
}

export class CommentEvent extends MetaEvent {

	#comment;

	constructor(prev, comment){
		super(prev);
		this.#comment = String(comment);
	}

	get comment(){
		return this.#comment;
	}

	get type(){
		return 'comment';
	}

	// Events

	trigger(){
		this.game.emit('comment', this.comment);
	}
}
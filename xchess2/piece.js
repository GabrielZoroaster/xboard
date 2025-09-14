
export {Piece}

import {Color} from './color.js'

class Piece {

	static is(value){
		try {
			value.#color;
			return value instanceof this;
		} catch {
			return false;
		}
	}

	static get id(){
		return 'piece';
	}

	static get code(){
		return 0;
	}

	static get whiteFen(){
		return '�';
	}

	static get blackFen(){
		return '�';
	}

	static get whiteSign(){
		return null;
	}

	static get blackSign(){
		return null;
	}

	static get moveLetter(){
		return '';
	}

	static get weight(){
		return 0;
	}

	static get isPromotable(){
		return true;
	}

	#color;

	constructor(color){
		this.#color = Color.from(color);
	}

	get color(){
		return this.#color;
	}

	get id(){
		return this.constructor.id;
	}

	get code(){
		return (this.constructor.code << 1) | this.color;
	}

	get fen(){
		if(this.color.isWhite)
			return this.constructor.whiteFen;
		if(this.color.isBlack)
			return this.constructor.blackFen;
		return null;
	}

	get sign(){
		if(this.color.isWhite)
			return this.constructor.whiteSign;
		if(this.color.isBlack)
			return this.constructor.blackSign;
		return null;
	}

	get moveLetter(){
		return this.constructor.moveLetter;
	}

	get weight(){
		return this.constructor.weight;
	}

	// Rules

	get isRoyal(){
		return false;
	}

	get isPawn(){
		return false;
	}

	get isLocked(){
		return false;
	}

	get isPromotable(){
		return this.constructor.isPromotable;
	}

	get isIrreversible(){
		return false;
	}

	get isMating(){
		return false;
	}

	get isCastlingActor(){
		return false;
	}

	get isCastlingPartner(){
		return false;
	}

	isCapturable(piece){
		return this.color.opposite(piece.color);
	}

	isPassable(piece){
		return false;
	}

	advantage(color){
		if(this.color.eq(color))
			return this.weight;
		return - this.weight;
	}

	* moves(state, from){
		// abstract
	}

	attacks(position, from, to){
		return false;
	}

	valueOf(){
		return this.code;
	}
}
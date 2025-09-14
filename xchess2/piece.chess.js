
import {Piece} from './piece.js'
import {Move} from './move.js'
import {moves, hits} from './index.js'

export class King extends Piece {

	static get id(){
		return 'king';
	}

	static get whiteFen(){
		return 'K';
	}

	static get blackFen(){
		return 'k';
	}

	static get whiteSign(){
		return '♔';
	}

	static get blackSign(){
		return '♚';
	}

	static get moveLetter(){
		return 'K';
	}

	static get code(){
		return 1;
	}

	static get weight(){
		return 0;
	}

	static get isPromotable(){
		return false;
	}

	get isRoyal(){
		return true;
	}

	get isCastlingActor(){
		return true;
	}

	moves({position}, from){
		return moves.Q(from, this, position);
	}

	attacks(position, from, to){
		return hits.Q(from, to);
	}
}

export class Queen extends Piece {

	static get id(){
		return 'queen';
	}

	static get whiteFen(){
		return 'Q';
	}

	static get blackFen(){
		return 'q';
	}

	static get whiteSign(){
		return '♕';
	}

	static get blackSign(){
		return '♛';
	}

	static get moveLetter(){
		return 'Q';
	}

	static get code(){
		return 2;
	}

	static get weight(){
		return 9;
	}

	get isMating(){
		return true;
	}

	moves({position}, from){
		return moves.QQ(from, this, position);
	}

	attacks(position, from, to){
		return hits.QQ(from, to, this, position);
	}
}

export class Rook extends Piece {

	static get id(){
		return 'rook';
	}

	static get whiteFen(){
		return 'R';
	}

	static get blackFen(){
		return 'r';
	}

	static get whiteSign(){
		return '♖';
	}

	static get blackSign(){
		return '♜';
	}

	static get moveLetter(){
		return 'R';
	}

	static get code(){
		return 3;
	}

	static get weight(){
		return 5;
	}

	get isMating(){
		return true;
	}

	get isCastlingPartner(){
		return true;
	}

	moves({position}, from){
		return moves.WW(from, this, position);
	}

	attacks(position, from, to){
		return hits.WW(from, to, this, position);
	}
}

export class Bishop extends Piece {

	static get id(){
		return 'bishop';
	}

	static get whiteFen(){
		return 'B';
	}

	static get blackFen(){
		return 'b';
	}

	static get whiteSign(){
		return '♗';
	}

	static get blackSign(){
		return '♝';
	}

	static get moveLetter(){
		return 'B';
	}

	static get code(){
		return 4;
	}

	static get weight(){
		return 3;
	}

	moves({position}, from){
		return moves.FF(from, this, position);
	}

	attacks(position, from, to){
		return hits.FF(from, to, this, position);
	}
}

export class Knight extends Piece {

	static get id(){
		return 'knight';
	}

	static get whiteFen(){
		return 'N';
	}

	static get blackFen(){
		return 'n';
	}

	static get whiteSign(){
		return '♘';
	}

	static get blackSign(){
		return '♞';
	}

	static get moveLetter(){
		return 'N';
	}

	static get weight(){
		return 3;
	}

	static get code(){
		return 5;
	}

	moves({position}, from){
		return moves.N(from, this, position);
	}

	attacks(position, from, to){
		return hits.N(from, to);
	}
}

export class Pawn extends Piece {

	static get id(){
		return 'pawn';
	}

	static get whiteFen(){
		return 'P';
	}

	static get blackFen(){
		return 'p';
	}

	static get whiteSign(){
		return '♙';
	}

	static get blackSign(){
		return '♟';
	}

	static get code(){
		return 6;
	}

	static get weight(){
		return 1;
	}

	static get isPromotable(){
		return false;
	}

	get isPawn(){
		return true;
	}

	get isIrreversible(){
		return true;
	}

	get isMating(){
		return true;
	}

	moves(state, from){
		return moves.pawn(from, this, state);
	}

	attacks(position, from, to){
		return hits.pawn(from, to, this);
	}
}

import {Piece} from './piece.js'
import {moves, hits} from './index.js'

export class Wazir extends Piece {

	static get id(){
		return 'wazir';
	}

	static get code(){
		return 10;
	}

	static get whiteFen(){
		return 'W';
	}

	static get blackFen(){
		return 'w';
	}

	static get moveLetter(){
		return 'W';
	}

	static get whiteSign(){
		return '▢';
	}

	static get blackSign(){
		return '▣';
	}

	moves(state, from){
		return moves.W(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.W(from, to);
	}
}

export class Ferz extends Piece {

	static get id(){
		return 'ferz';
	}

	static get code(){
		return 11;
	}

	static get whiteFen(){
		return 'V';
	}

	static get blackFen(){
		return 'v';
	}

	static get moveLetter(){
		return 'V';
	}

	static get whiteSign(){
		return '◇';
	}

	static get blackSign(){
		return '◆';
	}

	moves(state, from){
		return moves.F(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.F(from, to);
	}
}

export class Mann extends Piece {

	static get id(){
		return 'mann';
	}

	static get code(){
		return 12;
	}

	static get whiteFen(){
		return 'M';
	}

	static get blackFen(){
		return 'm';
	}

	static get moveLetter(){
		return 'M';
	}

	static get whiteSign(){
		return '◻';
	}

	static get blackSign(){
		return '◼';
	}

	moves(state, from){
		return moves.Q(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.Q(from, to);
	}
}

export class Dabbaba extends Piece {

	static get id(){
		return 'dabbaba';
	}

	static get code(){
		return 13;
	}

	static get whiteFen(){
		return 'D';
	}

	static get blackFen(){
		return 'd';
	}

	static get moveLetter(){
		return 'D';
	}

	static get whiteSign(){
		return '▯'	;
	}

	static get blackSign(){
		return '▮';
	}

	moves(state, from){
		return moves.D(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.D(from, to);
	}
}

export class Alfil extends Piece {

	static get id(){
		return 'alfil';
	}

	static get code(){
		return 14;
	}

	static get whiteFen(){
		return 'F';
	}

	static get blackFen(){
		return 'f';
	}

	static get moveLetter(){
		return 'F';
	}

	static get whiteSign(){
		return '✧';
	}

	static get blackSign(){
		return '✦';
	}

	moves(state, from){
		return moves.A(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.A(from, to);
	}
}

export class Threeleaper extends Piece {

	static get id(){
		return 'threeleaper';
	}

	static get code(){
		return 15;
	}

	static get whiteFen(){
		return 'L';
	}

	static get blackFen(){
		return 'l';
	}

	static get moveLetter(){
		return 'L';
	}

	static get whiteSign(){
		return '▨';
	}

	static get blackSign(){
		return '▩';
	}

	moves(state, from){
		return moves.H(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.H(from, to);
	}
}

export class Camel extends Piece {

	static get id(){
		return 'camel';
	}

	static get code(){
		return 16;
	}

	static get whiteFen(){
		return 'C';
	}

	static get blackFen(){
		return 'c';
	}

	static get moveLetter(){
		return 'C';
	}

	static get whiteSign(){
		return '◁';
	}

	static get blackSign(){
		return '◀';
	}

	moves(state, from){
		return moves.C(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.C(from, to);
	}
}

export class Zebra extends Piece {

	static get id(){
		return 'zebra';
	}

	static get code(){
		return 17;
	}

	static get whiteFen(){
		return 'Z';
	}

	static get blackFen(){
		return 'z';
	}

	static get moveLetter(){
		return 'Z';
	}

	static get whiteSign(){
		return '▷';
	}

	static get blackSign(){
		return '▶';
	}

	moves(state, from){
		return moves.Z(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.Z(from, to);
	}
}

export class Tripper extends Piece {

	static get id(){
		return 'tripper';
	}

	static get code(){
		return 18;
	}

	static get whiteFen(){
		return 'T';
	}

	static get blackFen(){
		return 't';
	}

	static get moveLetter(){
		return 'T';
	}

	static get whiteSign(){
		return '⧇';
	}

	static get blackSign(){
		return '⧆';
	}

	moves(state, from){
		return moves.G(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.G(from, to);
	}
}

export class Giraffe extends Piece {

	static get id(){
		return 'giraffe';
	}

	static get code(){
		return 19;
	}

	static get whiteFen(){
		return 'J';
	}

	static get blackFen(){
		return 'j';
	}

	static get moveLetter(){
		return 'J';
	}

	static get whiteSign(){
		return '▱';
	}

	static get blackSign(){
		return '▰';
	}

	moves(state, from){
		return moves.L(from, this, state.position, 1, 4);
	}

	attacks(position, from, to){
		return hits.L(from, to, 1, 4);
	}
}

export class Nightrider extends Piece {

	static get id(){
		return 'nightrider';
	}

	static get code(){
		return 20;
	}

	static get whiteFen(){
		return 'H';
	}

	static get blackFen(){
		return 'h';
	}

	static get moveLetter(){
		return 'H';
	}

	static get whiteSign(){
		return '⬡';
	}

	static get blackSign(){
		return '⬢';
	}

	moves(state, from){
		return moves.NN(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.NN(from, to, this, position);
	}
}

export class Empress extends Piece {

	static get id(){
		return 'empress';
	}

	static get code(){
		return 21;
	}

	static get whiteFen(){
		return 'E';
	}

	static get blackFen(){
		return 'e';
	}

	static get moveLetter(){
		return 'E';
	}

	static get whiteSign(){
		return '▿';
	}

	static get blackSign(){
		return '▾';
	}

	* moves(state, from){
		yield * moves.N(from, this, state.position);
		yield * moves.WW(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.N(from, to) || hits.WW(from, to, this, position);
	}
}

export class Princess extends Piece {

	static get id(){
		return 'princess';
	}

	static get code(){
		return 22;
	}

	static get whiteFen(){
		return 'S';
	}

	static get blackFen(){
		return 's';
	}

	static get moveLetter(){
		return 'S';
	}

	static get whiteSign(){
		return '⧊';
	}

	static get blackSign(){
		return '⧋';
	}

	* moves(state, from){
		yield * moves.N(from, this, state.position);
		yield * moves.FF(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.N(from, to) || hits.FF(from, to, this, position);
	}
}

export class Amazon extends Piece {

	static get id(){
		return 'amazon';
	}

	static get code(){
		return 23;
	}

	static get whiteFen(){
		return 'A';
	}

	static get blackFen(){
		return 'a';
	}

	static get moveLetter(){
		return 'A';
	}

	static get whiteSign(){
		return '☆';
	}

	static get blackSign(){
		return '★';
	}

	* moves(state, from){
		yield * moves.N(from, this, state.position);
		yield * moves.QQ(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.N(from, to) || hits.QQ(from, to, this, position);
	}
}

export class Grasshopper extends Piece {

	static get id(){
		return 'grasshopper';
	}

	static get code(){
		return 24;
	}

	static get whiteFen(){
		return 'G';
	}

	static get blackFen(){
		return 'g';
	}

	static get moveLetter(){
		return 'G';
	}

	static get whiteSign(){
		return '⦾';
	}

	static get blackSign(){
		return '⦿';
	}

	* moves(state, from){
		yield * moves.hopQ(from, this, state.position);
	}

	attacks(position, from, to){
		return hits.hopQ(from, to, this, position);
	}
}

export class Wall extends Piece {

	static get id(){
		return 'wall';
	}

	static get code(){
		return 25;
	}

	static get whiteFen(){
		return 'X';
	}

	static get blackFen(){
		return 'x';
	}

	static get moveLetter(){
		return 'X';
	}

	static get whiteSign(){
		return '#';
	}

	static get blackSign(){
		return '%';
	}

	static get isPromotable(){
		return false;
	}

	get isLocked(){
		return true;
	}

	isCapturable(piece){
		return false;
	}
}

export class Stone extends Piece {

	static get id(){
		return 'stone';
	}

	static get code(){
		return 26;
	}

	static get whiteFen(){
		return 'O';
	}

	static get blackFen(){
		return 'o';
	}

	static get moveLetter(){
		return 'O';
	}

	static get whiteSign(){
		return '@';
	}

	static get blackSign(){
		return '*';
	}

	static get isPromotable(){
		return false;
	}

	get isLocked(){
		return true;
	}
}
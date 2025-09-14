
import {MoveState} from './event.move.js'
import {PromotionState} from './event.promotion.js'
import {GetMoveDisambiguation} from './move.disambiguation.js'
import {PieceMoveToSAN} from './san.js'
import {INVALID_PROMOTION_CHOICE} from './errors.js'

function PieceMoveCode(move){
	return move.from * move.from.board.size + move.to;
}

function IsSet(value){
	return value !== undefined && value !== null;
}

export class Move {

	#color;

	constructor(color){
		this.#color = color;
	}

	get color(){
		return this.#color;
	}

	get code(){
		return null;
	}

	get isPieceMove(){
		return false;
	}

	get isCapture(){
		return false;
	}

	get isIrreversible(){
		return false;
	}

	get isPromotable(){
		return false;
	}

	get disambiguation(){
		return GetMoveDisambiguation(this);
	}

	isCheck(position){
		return false;
	}

	match(query){
		return false;
	}

	apply(prev){
		const state = prev.state;
		const position = this.project(state.position);
		const color = state.color.invert();
		const castling = state.castling.apply(this);
		const enPassant = this.enPassant();
		const fullmoveNumber = state.fullmoveNumber + this.color;
		const halfmoveClock = this.isIrreversible ? 0 : state.halfmoveClock + 1;
		const args = {position, color, castling, enPassant, fullmoveNumber, halfmoveClock};
		return new MoveState(prev, args, this);
	}

	project(position){
		return position;
	}

	enPassant(){
		return null;
	}

	trigger(game){
		// abstract
	}

	toString(options){
		return '?';
	}

	toSAN(options){
		return this.toString(options);
	}
}

export class AbstractPieceMove extends Move {

	get piece(){
		return null;
	}

	get from(){
		return null;
	}

	get to(){
		return null;
	}

	get captured(){
		return null;
	}

	get capturedAt(){
		return null;
	}

	get promoteTo(){
		return null;
	}

	get qc(){
		return false;
	}

	get kc(){
		return false;
	}

	get isPieceMove(){
		return true;
	}

	get code(){
		return PieceMoveCode(this);
	}

	toString(options){
		return PieceMoveToSAN(this, options);
	}

	project(position){
		position = position.clone();
		this.mutate(position);
		return position.freeze();
	}

	isCheck(position){
		position = position.clone();
		this.mutate(position);
		return position.isCheck(this.color);
	}

	trigger(game){
		game.emit('transfer', {piece: this.piece, from: this.from, to: this.to});
	}

	match(query){
		const {piece, from, to, fromFile, fromRank, promoteTo, qc, kc} = query;
		if(IsSet(piece) && (this.piece.moveLetter !== piece))
			return false;
		if(from && !this.from.eq(from))
			return false;
		if(to && !this.to.eq(to))
			return false;
		if(fromFile && !this.from.file.eq(fromFile))
			return false;
		if(fromRank && !this.from.rank.eq(fromRank))
			return false;
		if(promoteTo && !(this.promoteTo && (this.promoteTo.moveLetter === promoteTo)))
			return false;
		if(!promoteTo && this.promoteTo)
			return false;
		if(qc && !this.qc)
			return false;
		if(kc && !this.kc)
			return false;
		return true;
	}
}

export class PieceMoveWrapper extends AbstractPieceMove {

	#target;

	constructor(target){
		super(target.color);
		this.#target = target;
	}

	get target(){
		return this.#target;
	}

	get piece(){
		return this.target.piece;
	}

	get from(){
		return this.target.from;
	}

	get to(){
		return this.target.to;
	}

	get captured(){
		return this.target.captured;
	}

	get capturedAt(){
		return this.target.capturedAt;
	}

	get isCapture(){
		return this.target.isCapture;
	}

	get isIrreversible(){
		return this.target.isIrreversible;
	}
}

export class PieceMove extends AbstractPieceMove {

	#piece;
	#from;
	#to;

	constructor(piece, from, to){
		super(piece.color);
		this.#piece = piece;
		this.#from = from;
		this.#to = to;
	}

	get piece(){
		return this.#piece;
	}

	get from(){
		return this.#from;
	}

	get to(){
		return this.#to;
	}

	get captured(){
		return null;
	}

	get capturedAt(){
		return null;
	}

	get promoteTo(){
		return null;
	}

	get isIrreversible(){
		return this.piece.isIrreversible;
	}

	mutate(position){
		position.move(this.from, this.to);
	}
}

export class CaptureMove extends PieceMove {

	#captured;
	#capturedAt;

	constructor(piece, from, to, captured, capturedAt){
		super(piece, from, to);
		this.#captured = captured;
		this.#capturedAt = capturedAt;
	}

	get captured(){
		return this.#captured;
	}

	get capturedAt(){
		return this.#capturedAt;
	}

	get isCapture(){
		return true;
	}

	get isIrreversible(){
		return true;
	}

	trigger(game){
		game.emit('remove', {piece: this.captured, square: this.capturedAt});
		game.emit('transfer', {piece: this.piece, from: this.from, to: this.to});
		game.emit('capture', this);
	}

	mutate(position){
		position.delete(this.capturedAt);
		position.move(this.from, this.to);
	}
}

export class PawnDoubleMove extends PieceMove {

	enPassant(){
		return this.from.dy(this.color.moveDir);
	}

	trigger(game){
		super.trigger(game);
		game.emit('double-pawn-move', this);
	}
}

export class EnPassantMove extends CaptureMove {

	trigger(game){
		super.trigger(game);
		game.emit('en-passant', this);
	}

	toString(options){
		return `${super.toString(options)} e.p.`;
	}
}

export class CastlingMove extends PieceMove {

	#rook;
	#rookFrom;
	#rookTo;

	constructor(piece, from, to, rook, rookFrom, rookTo){
		super(piece, from, to);
		this.#rook = rook;
		this.#rookFrom = rookFrom;
		this.#rookTo = rookTo;
	}

	get rook(){
		return this.#rook;
	}

	get rookFrom(){
		return this.#rookFrom;
	}

	get rookTo(){
		return this.#rookTo;
	}

	mutate(position){
		position.set(this.to, this.piece);
		position.set(this.rookTo, this.rook);
	}

	trigger(game){
		game.emit('transfer', {piece: this.piece, from: this.from, to: this.to});
		game.emit('transfer', {piece: this.rook, from: this.rookFrom, to: this.rookTo});
		game.emit('castling', this);
	}
}

export class KingCastlingMove extends CastlingMove {

	get kc(){
		return true;
	}

	toString(){
		return 'O-O';
	}
}

export class QueenCastlingMove extends CastlingMove {

	get qc(){
		return true;
	}

	toString(){
		return 'O-O-O';
	}
}

export class PromotionMove extends PieceMoveWrapper {

	#promoteTo;

	constructor(target, promoteTo){
		super(target);
		this.#promoteTo = promoteTo;
	}

	get promoteTo(){
		return this.#promoteTo;
	}

	toString(options){
		return `${super.toString(options)}=${this.promoteTo.moveLetter}`;
	}

	mutate(position){
		position.delete(this.from);
		position.set(this.to, this.promoteTo);
	}

	trigger(game){
		this.target.trigger(game);
		game.emit('remove', {piece: this.piece, square: this.to});
		game.emit('insert', {piece: this.promoteTo, square: this.to});
		game.emit('promote', this);
	}
}

export class PromotionFinalizeMove extends PromotionMove {

	mutate(position){
		position.set(this.to, this.promoteTo);
	}

	trigger(game){
		game.emit('remove', {piece: this.piece, square: this.to});
		game.emit('insert', {piece: this.promoteTo, square: this.to});
		game.emit('promote', this);
	}
}

export class PromotionPendingMove extends PieceMoveWrapper {

	#promotes;

	constructor(target, promotes){
		super(target);
		this.#promotes = promotes;
	}

	get promotes(){
		return this.#promotes;
	}

	get isPromotable(){
		return true;
	}

	get promoteTo(){
		return null;
	}

	promote(piece){
		if(this.promotes.some(type => type.is(piece)))
			return new PromotionFinalizeMove(this.target, piece);
		throw INVALID_PROMOTION_CHOICE();
	}

	mutate(position){
		this.target.mutate(position);
	}

	apply(prev){
		const state = prev.state;
		const position = this.project(state.position);
		return new PromotionState(prev, position, this);
	}

	trigger(game){
		this.target.trigger(game);
	}
}
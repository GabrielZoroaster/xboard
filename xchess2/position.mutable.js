
import {Position} from './position.js'
import {IS_STRING, IS_OBJECT, IS_ITERABLE} from './types.js'
import {PositionToFen, FenToPosition} from './fen.js'
import {white, black} from './color.js'
import {King, Queen, Rook, Bishop, Knight, Pawn} from './piece.chess.js'
import {EMPTY_SQUARE, INVALID_POSITION} from './errors.js'
import {ImmutablePosition} from './position.immutable.js'
import {Sample, Setup, Setup960} from './setup.js'

function PositionToMap(game, position){
	if(IS_STRING(position))
		return FenToPosition(game, position);
	if(IS_ITERABLE(position))
		return IterableToPosition(game, position);
	if(IS_OBJECT(position))
		return IterableToPosition(game, Object.entries(position));
	throw INVALID_POSITION(position);
}

function IterableToPosition(game, squares){
	const position = new Map();
	for(const [squareArg, pieceArg] of squares){
		const square = game.board.req(squareArg);
		const piece = game.bestiary.from(pieceArg);
		position.set(square, piece);
	}	return position;
}

function ArraySample(array, count) {
  const result = [];
  for (let i = 0; result.length < count; i++) {
    const j = i + Math.floor(Math.random() * (array.length - i));
    [array[i], array[j]] = [array[j], array[i]];
    result.push(array[i]);
  }
  return result;
}

export class MutablePosition extends Position {

	#squares = new Map();
	#pieces = new Map();

	constructor(game, position = []){
		super(game);
		this.#init(position);
	}

	#init(position){
		for(const [square, piece] of PositionToMap(this.game, position)){
			const oldSquare = this.#pieces.get(piece);
			if(oldSquare) this.#squares.delete(oldSquare);
			this.#squares.set(square, piece);
			this.#pieces.set(piece, square);
		}
	}

	// Read

	get size(){
		return this.#squares.size;
	}

	at(x, y){
		return this.#squares.get(this.board.at(x, y));
	}

	get(square){
		return this.#squares.get(this.board.req(square));
	}

	has(square){
		return this.#squares.get(this.board.req(square));
	}

	find(piece){
		return this.#pieces.get(piece);
	}

	contains(piece){
		return this.#pieces.has(piece);
	}

	keys(){
		return this.#squares.keys();
	}

	values(){
		return this.#squares.values();
	}

	entries(){
		return this.#squares.entries();
	}

	// Write

	#set(square, piece){
		const oldSquare = this.#pieces.get(piece);
		const oldPiece = this.#squares.get(square);
		if(square !== oldSquare){
			this.#squares.set(square, piece);
			this.#pieces.set(piece, square);
			if(oldSquare){
				this.#squares.delete(oldSquare);
				this.#pieces.delete(oldPiece);
			}
			if(oldPiece)
				this.#onRemove(oldPiece, square);
			if(oldSquare)
				this.#onTransfer(piece, oldSquare, square);
			else
				this.#onInsert(piece, square);
		}
	}

	set(square, piece){
		this.#set(this.board.req(square), this.bestiary.from(piece));
	}

	delete(squareArg){
		const square = this.board.req(squareArg);
		const piece = this.#squares.get(square);
		if(piece){
			this.#squares.delete(square);
			this.#pieces.delete(piece);
			this.#onRemove(piece, square);
			return true;
		}	return false;
	}

	clear(){
		if(this.size > 0){
			this.#squares.clear();
			this.#pieces.clear();
			this.#onClear();
		}
	}

	move(fromArg, toArg){
		const from = this.board.req(fromArg);
		const to = this.board.req(toArg);
		const piece = this.#squares.get(from);
		if(piece){
			if(from !== to){
				const oldPiece = this.#squares.get(to);
				this.#squares.delete(from);
				this.#squares.set(to, piece);
				this.#pieces.set(piece, to);
				if(oldPiece) this.#onRemove(oldPiece, to);
				this.#onTransfer(piece, from, to);
			}
		} else throw EMPTY_SQUARE(from);
	}

	setAll(position){
		const squares = PositionToMap(this.game, position);
		this.clear();
		for(const [square, piece] of squares)
			this.#set(square, piece);
	}

	merge(position){
		for(const [square, piece] of PositionToMap(this.game, position))
			this.#set(square, piece);
	}

	fill(piece){
		for(const square of this.board)
			this.set(square, piece);
	}

	fillFile(file, piece){
		for(const square of this.board.file(file).squares)
			this.set(square, piece);
	}

	fillRank(rank, piece){
		for(const square of this.board.rank(rank).squares)
			this.set(square, piece);
	}

	// Listeners

	emit(eventType, ... args){
		// on Event
	}

	// Events

	#onInsert(piece, square){
		this.emit('insert', {piece, square});
	}

	#onRemove(piece, square){
		this.emit('remove', {piece, square});
	}

	#onTransfer(piece, from, to){
		this.emit('transfer', {piece, from, to});
	}

	#onClear(){
		this.emit('clear');
	}

	// Clone

	clone(){
		return new MutablePosition(this.game, this.#squares);
	}

	freeze(){
		return new ImmutablePosition(this.game, this.#squares);
	}

	// I/O

	get fen(){
		return PositionToFen(this);
	}

	set fen(fen){
		const squares = FenToPosition(this.game, String(fen));
		this.clear();
		for(const [square, piece] of squares)
			this.#set(square, piece);
	}

	// Setup

	king(square, color){
		this.set(square, new King(color));
	}

	queen(square, color){
		this.set(square, new Queen(color));
	}

	rook(square, color){
		this.set(square, new Rook(color));
	}

	bishop(square, color){
		this.set(square, new Bishop(color));
	}

	knight(square, color){
		this.set(square, new Knight(color));
	}

	pawn(square, color){
		this.set(square, new Pawn(color));
	}

	K(square){
		this.king(square, white);
	}

	Q(square){
		this.queen(square, white);
	}

	R(square){
		this.rook(square, white);
	}

	B(square){
		this.bishop(square, white);
	}

	N(square){
		this.knight(square, white);
	}

	P(square){
		this.pawn(square, white);
	}

	k(square){
		this.king(square, black);
	}

	q(square){
		this.queen(square, black);
	}

	r(square){
		this.rook(square, black);
	}

	b(square){
		this.bishop(square, black);
	}

	n(square){
		this.knight(square, black);
	}

	p(square){
		this.pawn(square, black);
	}

	shuffle(){
		const squares = [... this.board];
		const pieces = [... this.values()];
		const sample = ArraySample(squares, pieces.length);
		const result = new Map();
		const transfer = [];
		let i = 0;
		for(const to of sample){
			const piece = pieces[i ++];
			const from = this.#pieces.get(piece);
			result.set(to, piece);
			this.#pieces.set(piece, to);
			transfer.push([piece, from, to]);
		}
		this.#squares = result;
		transfer.forEach(args => this.#onTransfer(... args));
	}

	sample(probability){
		return Sample(this, probability);
	}

	setup(){
		return Setup(this);
	}

	setup960(){
		return Setup960(this);
	}
}

export class SetupPosition extends MutablePosition {

	emit(... args){
		if(this.game.position === this)
			this.game.emit(... args);
	}
}
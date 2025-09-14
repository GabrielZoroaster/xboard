
import {Color} from './color.js'
import {CastlingMove, KingCastlingMove, QueenCastlingMove} from './move.js'
import {CastlingToFen, SetupCastlingToFen, FenToCastling} from './fen.js'
import {IS_STRING, IS_OBJECT, IS_ITERABLE} from './types.js'
import {INVALID_CASTLING, INVALID_CASTLING_ALIGNMENT, INVALID_CASTLING_SQUARES, EDIT_LOCKED} from './errors.js'

class Castle {

	#kingFrom;
	#kingTo;
	#rookFrom;
	#rookTo;

	constructor(kingFrom, kingTo, rookFrom, rookTo){
		this.#kingFrom = kingFrom;
		this.#kingTo = kingTo;
		this.#rookFrom = rookFrom;
		this.#rookTo = rookTo;
		TestCastleSquares(this);
	}

	get kingFrom(){
		return this.#kingFrom;
	}

	get kingTo(){
		return this.#kingTo;
	}

	get rookFrom(){
		return this.#rookFrom;
	}

	get rookTo(){
		return this.#rookTo;
	}

	get wk(){
		return false;
	}

	get wq(){
		return false;
	}

	get bk(){
		return false;
	}

	get bq(){
		return false;
	}

	get fen(){
		return `[${this.kingFrom}${this.kingTo}${this.rookFrom}${this.rookTo}]`;
	}

	* [Symbol.iterator](){
		yield this.kingFrom;
		yield this.kingTo;
		yield this.rookFrom;
		yield this.rookTo;
	}

	toArray(){
		return [... this];
	}

	valid(position){
		const king = position.get(this.kingFrom);
		const rook = position.get(this.rookFrom);
		return king && rook && (king.color === rook.color);
	}

	toMove(position){
		const king = position.get(this.kingFrom);
		const rook = position.get(this.rookFrom);
		return new CastlingMove(king, this.kingFrom, this.kingTo, rook, this.rookFrom, this.rookTo);
	}

	involves(move){
		if(this.kingFrom === move.from)
			return true;
		if(this.rookFrom === move.from)
			return true;
		if(this.kingFrom === move.capturedAt)
			return true;
		if(this.rookFrom === move.capturedAt)
			return true;
		return false;
	}

	available(state){
		const position = state.position;
		const king = position.get(this.kingFrom);
		const rook = position.get(this.rookFrom);
		// Color
		if(!state.color.eq(king.color))
			return false;
		// Passable
		for(const square of this.rookPath()){
			if(square === this.kingFrom)
				continue;
			if(position.has(square))
				return false;
		}
		for(const square of this.kingPath()){
			if(square === this.rookFrom)
				continue;
			if(position.has(square))
				return false;
		}
		// Attacks
		if(position.attacks(this.kingFrom, king))
			return false;
		for(const square of this.kingPath())
			if(position.attacks(square, king))
				return false;
		return true;
	}
}

function EqFile(first, ... squares){
	for(const square of squares)
		if(first.x !== square.x)
			return false;
	return true;
}

function EqRank(first, ... squares){
	for(const square of squares)
		if(first.y !== square.y)
			return false;
	return true;
}

function * FileRange(from, to){
	while(from.y < to.y){
		from = from.dy(1);
		yield from;
	}
	while(from.y > to.y){
		from = from.dy(-1);
		yield from;
	}
}

function * RankRange(from, to){
	while(from.x < to.x){
		from = from.dx(1);
		yield from;
	}
	while(from.x > to.x){
		from = from.dx(-1);
		yield from;
	}
}

class FileCastle extends Castle {

	kingPath(){
		return FileRange(this.kingFrom, this.kingTo);
	}

	rookPath(){
		return FileRange(this.rookFrom, this.rookTo);
	}
}

class RankCastle extends Castle {

	kingPath(){
		return RankRange(this.kingFrom, this.kingTo);
	}

	rookPath(){
		return RankRange(this.rookFrom, this.rookTo);
	}
}

class KingCastle extends RankCastle {

	toMove(position){
		const king = position.get(this.kingFrom);
		const rook = position.get(this.rookFrom);
		return new KingCastlingMove(king, this.kingFrom, this.kingTo, rook, this.rookFrom, this.rookTo);
	}
}

class QueenCastle extends RankCastle {

	toMove(position){
		const king = position.get(this.kingFrom);
		const rook = position.get(this.rookFrom);
		return new QueenCastlingMove(king, this.kingFrom, this.kingTo, rook, this.rookFrom, this.rookTo);
	}
}

class WK extends KingCastle {

	get wk(){
		return true;
	}

	get fen(){
		return 'K';
	}
}

class WQ extends QueenCastle {

	get wq(){
		return true;
	}

	get fen(){
		return 'Q';
	}
}

class	BK extends KingCastle {

	get bk(){
		return true;
	}

	get fen(){
		return 'k';
	}
}

class	BQ extends QueenCastle {

	get bq(){
		return true;
	}

	get fen(){
		return 'q';
	}
}

function CreateCastle(game, ... args){
	const squares = args.map(arg => game.board.req(arg));
	if(EqRank(... squares))
		return new RankCastle(... squares);
	if(EqFile(... squares))
		return new FileCastle(... squares);
	throw INVALID_CASTLING_ALIGNMENT();
}

function TestCastleSquares(castle){
	if(castle.kingFrom === castle.rookFrom)
		throw INVALID_CASTLING_SQUARES();
	if(castle.kingTo === castle.rookTo)
		throw INVALID_CASTLING_SQUARES();
}

function CastlingFrom(game, castling){
	if(IS_STRING(castling))
		return CastlingFromFen(game, castling);
	if(castling instanceof Castling)
		return CastlingFromCastling(game, castling);
	if(castling instanceof SetupCastling)
		return CastlingFromSetupCastling(game, castling);
	if(IS_ITERABLE(castling))
		return CastlingFromIterator(game, castling);
	if(IS_OBJECT(castling))
		return CastlingFromObject(game, castling);
	throw INVALID_CASTLING(castling);
}

function CastlingFromFen(game, fen){
	return CastlingFromIterator(game, FenToCastling(game, fen));
}

function CastlingFromIterator(game, castling){
	const flags = {};
	const castles = [];
	for(const castle of castling){
		if(castle === 'K')
			flags.wk = true;
		else if(castle === 'Q')
			flags.wq = true;
		else if(castle === 'k')
			flags.bk = true;
		else if(castle === 'q')
			flags.bq = true;
		else castles.push(CastleFrom(game, castle));
	}	return new SetupCastling(game, flags, castles);
}

function CastlingFromCastling(game, castling){
	const flags = {};
	const castles = [];
	for(const castle of castling){
		if(castle.wk)
			flags.wk = true;
		else if(castle.wq)
			flags.wq = true;
		else if(castle.bk)
			flags.bk = true;
		else if(castle.bq)
			flags.bq = true;
		else castles.push(castle);
	}
	return new SetupCastling(game, flags, castles);
}

function CastlingFromSetupCastling(game, castling){
	return new SetupCastling(game, castling, castling);
}

function CastlingFromObject(game, flags){
	return new SetupCastling(game, flags);
}

function CastleFrom(game, castle){
	if(castle instanceof Castle)
		return castle;
	if(IS_ITERABLE(castle))
		return CastleFromArray(game, ... castle);
	if(IS_OBJECT(castle))
		return CastleFromObject(game, castle);
	throw INVALID_CASTLING();
}

function CastleFromArray(game, kingFrom, kingTo, rookFrom, rookTo){
	return CreateCastle(game, kingFrom, kingTo, rookFrom, rookTo);
}

function CastleFromObject(game, {kingFrom, kingTo, rookFrom, rookTo}){
	return CreateCastle(game, kingFrom, kingTo, rookFrom, rookTo);
}

function GenerateChess960Castle(board, color, kingFrom, rookFrom){
	if(kingFrom.x < rookFrom.x){
		const kingTo = board.at(6, kingFrom.y);
		const rookTo = board.at(5, rookFrom.y);
		if(color.isWhite)
			return new WK(kingFrom, kingTo, rookFrom, rookTo);
		if(color.isBlack)
			return new BK(kingFrom, kingTo, rookFrom, rookTo);
	}
	if(kingFrom.x > rookFrom.x){
		const kingTo = board.at(2, kingFrom.y);
		const rookTo = board.at(3, rookFrom.y);
		if(color.isWhite)
			return new WQ(kingFrom, kingTo, rookFrom, rookTo);
		if(color.isBlack)
			return new BQ(kingFrom, kingTo, rookFrom, rookTo);
	}
}

function GenerateChessCastle(board, color, kingFrom, rookFrom){
	const castleDir = Math.sign(rookFrom.x - kingFrom.x);
	const kingTo = kingFrom.dx(castleDir * 2) ?? kingFrom.dx(castleDir);
	const rookTo = kingTo.dx(- castleDir);
	if(castleDir > 0){
		if(color.isWhite)
			return new WK(kingFrom, kingTo, rookFrom, rookTo);
		if(color.isBlack)
			return new BK(kingFrom, kingTo, rookFrom, rookTo);
	}
	if(castleDir < 0){
		if(color.isWhite)
			return new WQ(kingFrom, kingTo, rookFrom, rookTo);
		if(color.isBlack)
			return new BQ(kingFrom, kingTo, rookFrom, rookTo);
	}
}

function GenerateCastle(board, color, kingFrom, rookFrom){
	if(board.width === 8){
		return GenerateChess960Castle(board, color, kingFrom, rookFrom);
	} return GenerateChessCastle(board, color, kingFrom, rookFrom);
}

function FindRankCastle(position, squares, color){
	let kingFrom = null;
	for(const square of squares){
		const piece = position.get(square);
		if(piece && piece.color === color){
			if(kingFrom && piece.isCastlingPartner)
				return GenerateCastle(position.board, color, kingFrom, square);
			if(piece.isCastlingActor)
				kingFrom = square;
		}
	}	return null;
}

function * Reverse(squares){
	for(let x = squares.length - 1; x >= 0; x --)
		yield squares[x];
}

function FindKingCastle(position, ranks, color){
	for(const rank of ranks){
		const castle = FindRankCastle(position, rank.squares, color);
		if(castle) return castle;
	}	return null;
}

function FindQueenCastle(position, ranks, color){
	for(const rank of ranks){
		const castle = FindRankCastle(position, Reverse(rank.squares), color);
		if(castle) return castle;
	}	return null;
}

function FindWK(position){
	return FindKingCastle(position, position.board.ranksReversed, Color.white);
}

function FindWQ(position){
	return FindQueenCastle(position, position.board.ranksReversed, Color.white);
}

function FindBK(position){
	return FindKingCastle(position, position.board.ranks, Color.black);
}

function FindBQ(position){
	return FindQueenCastle(position, position.board.ranks, Color.black);
}

function * PrepareCastling(castling, position){
	if(castling.wk){
		const castle = FindWK(position);
		if(castle) yield castle;
	}
	if(castling.wq){
		const castle = FindWQ(position);
		if(castle) yield castle;
	}
	if(castling.bk){
		const castle = FindBK(position);
		if(castle) yield castle;
	}
	if(castling.bq){
		const castle = FindBQ(position);
		if(castle) yield castle;
	}
	yield * castling.valid(position);
}

export class Castling {

	#castles;

	constructor(castles){
		this.#castles = [... castles];
	}

	get wk(){
		for(const castle of this)
			if(castle.wk)
				return true;
		return false;
	}

	get wq(){
		for(const castle of this)
			if(castle.wq)
				return true;
		return false;
	}

	get bk(){
		for(const castle of this)
			if(castle.bk)
				return true;
		return false;
	}

	get bq(){
		for(const castle of this)
			if(castle.bq)
				return true;
		return false;
	}

	setWK(value){
		throw EDIT_LOCKED();
	}

	setWQ(value){
		throw EDIT_LOCKED();
	}

	setBK(value){
		throw EDIT_LOCKED();
	}

	setBQ(value){
		throw EDIT_LOCKED();
	}

	get fen(){
		return CastlingToFen(this);
	}

	[Symbol.iterator](){
		return this.#castles.values();
	}

	get size(){
		return this.#castles.length;
	}

	toArray(){
		return [... this];
	}

	* moves(state){
		for(const castle of this)
			if(castle.available(state))
				yield castle.toMove(state.position);
	}

	apply(move){
		const castles = [];
		for(const castle of this)
			if(!castle.involves(move))
				castles.push(castle);
		if(castles.length < this.size)
			return new Castling(castles);
		return this;
	}
}

export class SetupCastling {

	static from(game, value){
		return CastlingFrom(game, value);
	}

	#game;
	#wk;
	#wq;
	#bk;
	#bq;
	#castles;

	constructor(game, {wk = false, wq = false, bk = false, bq = false}, castles = []){
		this.#game = game;
		this.#wk = Boolean(wk);
		this.#wq = Boolean(wq);
		this.#bk = Boolean(bk);
		this.#bq = Boolean(bq);
		this.#castles = new Set(castles);
	}

	get game(){
		return this.#game;
	}

	get wk(){
		return this.#wk;
	}

	get wq(){
		return this.#wq;
	}

	get bk(){
		return this.#bk;
	}

	get bq(){
		return this.#bq;
	}

	set wk(value){
		this.setWK(value);
	}

	set wq(value){
		this.setWQ(value);
	}

	set bk(value){
		this.setBK(value);
	}

	set bq(value){
		this.setBQ(value);
	}

	#change(){
		if(this.game.castling === this)
			this.game.emit('change');
	}

	setWK(value){
		const wk = Boolean(value);
		if(this.wk !== wk){
			this.#wk = wk;
			this.#change();
		}
	}

	setWQ(value){
		const wq = Boolean(value);
		if(this.wq !== wq){
			this.#wq = wq;
			this.#change();
		}
	}

	setBK(value){
		const bk = Boolean(value);
		if(this.bk !== bk){
			this.#bk = bk;
			this.#change();
		}
	}

	setBQ(value){
		const bq = Boolean(value);
		if(this.bq !== bq){
			this.#bq = bq;
			this.#change();
		}
	}

	add(kingFrom, kingTo, rookFrom, rookTo){
		const castle = CreateCastle(this.game, kingFrom, kingTo, rookFrom, rookTo);
		this.#castles.add(castle);
		this.#change();
		return castle;
	}

	delete(castle){
		if(this.#castles.delete(castle)){
			this.#change();
			return true;
		}	return false;
	}

	clear(){
		if(this.size > 0){
			this.#castles.clear();
			this.#change();
		}
	}

	has(castle){
		return this.#castles.has(castle);
	}

	get size(){
		return this.#castles.size;
	}

	[Symbol.iterator](){
		return this.#castles.values();
	}

	toArray(){
		return [... this];
	}

	get fen(){
		return SetupCastlingToFen(this);
	}

	* valid(position){
		for(const castle of this)
			if(castle.valid(position))
				yield castle;
	}

	prepare(position){
		return new Castling(PrepareCastling(this, position));
	}
}
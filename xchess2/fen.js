
import {Color} from './color.js'

function OUT_OF_BOUNDS(x, y){
	return new Error(`Piece placed outside the board`);
}

function UNCLOSED_TAG(){
	return new Error(`Missing closing ]`);
}

function FEN_UNKNOWN_SYMBOL(char){
	return new Error(`Unknown character in FEN string`);
}

function MISSING_COLOR(){
	return new Error('missing color');
}

function MISSING_CASTLING(){
	return new Error('missing castling');
}

function MISSING_ENPASSANT(){
	return new Error('missing enPassant');
}

function MISSING_HALFMOVECLOCK(){
	return new Error('missing halfmoveClock');
}

function MISSING_FULLMOVENUMBER(){
	return new Error('missing fullmoveNumber');
}

function MISSING_SQUARE(){
	return new Error('missing square');
}

export function PositionToFen(position){
	const fen = [];
	for(const rank of position.board.ranks){
		const squares = [];
		let gap = 0;
		for(const square of rank.squares){
			const piece = position.get(square);
			if(piece){
				if(gap > 0){
					squares.push(gap);
					gap = 0;
				}
				const char = piece.fen;
				if(char.length > 1)
					squares.push(`[${char}]`);
				else
					squares.push(char);
			} else gap ++;
		}
		if(gap > 0) squares.push(gap);
		fen.push(squares.join(''));
	}
	return fen.join('/');
}

export function EnPassantToFen(square){
	if(square) return square.toString();
	return '-';
}

function Fen(... args){
	if(args.length > 0)
		return args.join('');
	return '-';
}

function * CastlesToFen(castling){
	for(const castle of castling)
		yield castle.fen;
}

function * SetupCastlesToFen(castling){
	if(castling.wk) yield 'K';
	if(castling.wq) yield 'Q';
	if(castling.bk) yield 'k';
	if(castling.bq) yield 'q';
	yield * CastlesToFen(castling);
}

export function CastlingToFen(castling){
	return Fen(... CastlesToFen(castling));
}

export function SetupCastlingToFen(castling){
	return Fen(... SetupCastlesToFen(castling));
}

export function StateToFen(state){
	const fen = [];
	fen.push(PositionToFen(state.position));
	fen.push(state.color.fen);
	fen.push(state.castling.fen);
	fen.push(EnPassantToFen(state.enPassant));
	fen.push(state.halfmoveClock);
	fen.push(state.fullmoveNumber);
	return fen.join(' ');
}

export function FenToState(game, fen){
	const parser = new FenParser(game, fen);
	const state = parser.state();
	parser.end();
	return state;
}

export function FenToPosition(game, fen){
	const parser = new FenParser(game, fen);
	const position = parser.position();
	parser.end();
	return position;
}

export function FenToCastling(game, fen){
	const parser = new FenParser(game, fen);
	const castling = parser.castling();
	parser.end();
	return castling;
}

class FenParser {

	#game;
	#fen;
	#offset = 0;
	#x = 0;
	#y = 0;
	#position = new Map();

	constructor(game, fen){
		this.#game = game;
		this.#fen = fen;
	}

	get game(){
		return this.#game;
	}

	get fen(){
		return this.#fen;
	}

	get offset(){
		return this.#offset;
	}

	get x(){
		return this.#x;
	}

	get y(){
		return this.#y;
	}

	get length(){
		return this.fen.length;
	}

	get isEnd(){
		return this.offset >= this.length;
	}

	get char(){
		return this.fen[this.offset];
	}

	get isWS(){
		return /\s/.test(this.char);
	}

	get isNone(){
		return this.char === '-';
	}

	get isSep(){
		return this.char === '/';
	}

	get beginInt(){
		return '123456789'.includes(this.char);
	}

	get isDec(){
		return '0123456789'.includes(this.char);
	}

	get isFile(){
		return 'abcdefghijklmnopqrstuvwyz'.includes(this.char);
	}

	get isGap(){
		return this.beginInt;
	}

	get isPiece(){
		return /\S/.test(this.char);
	}

	get isCastle(){
		return 'KQkq'.includes(this.char);
	}

	get isStartTag(){
		return this.char === '[';
	}

	get isEndTag(){
		return this.char === ']';
	}

	next(){
		this.#offset ++;
	}

	trim(){
		while(this.isWS) this.next();
	}

	none(){
		if(this.isNone){
			this.next();
			return true;
		} return false;
	}

	endTag(){
		if(this.isEndTag)
			this.next();
		else throw UNCLOSED_TAG();
	}

	at(){
		const square = this.game.board.at(this.x, this.y);
		if(square) return square;
		throw OUT_OF_BOUNDS(this.x, this.y);
	}

	sep(){
		this.#x = 0;
		this.#y ++;
		this.next();
	}

	readInt(){
		const value = [];
		do {
			value.push(this.char);
			this.next();
		} while(this.isDec);
		return + value.join('');
	}

	int(){
		if(this.beginInt)
			return this.readInt();
		return null;
	}

	zero(){
		if(this.char === '0'){
			this.next();
			return true;
		}	return false;
	}

	gap(){
		this.#x += this.readInt();
	}

	piece(){
		const square = this.at();
		const piece = this.game.bestiary.from(this.char);
		this.#position.set(square, piece);
		this.#x ++;
		this.next();
	}

	longPiece(){
		this.next();
		const chars = [];
		while(!this.isEndTag && !this.isEnd){
			chars.push(this.char);
			this.next();
		}
		this.endTag();
		const name = chars.join('');
		const square = this.at();
		const piece = this.game.bestiary.from(name);
		this.#position.set(square, piece);
		this.#x ++;
	}

	position(){
		while(!this.isEnd){
			if(this.isWS)
				break;
			if(this.isSep)
				this.sep();
			else if(this.isGap)
				this.gap();
			else if(this.isStartTag)
				this.longPiece();
			else if(this.isPiece)
				this.piece();
			else break;
		}	return this.#position;
	}

	color(){
		if(this.char === 'w'){
			this.next();
			return Color.white;
		}
		if(this.char === 'b'){
			this.next();
			return Color.black;
		}
		throw FEN_MISSING_COLOR();
	}

	file(){
		if(this.isFile){
			const file = [];
			do {
				file.push(this.char);
				this.next();
			} while(this.isFile);
			return file.join('');
		}
	}

	rank(){
		return this.int();
	}

	square(){
		const file = this.file();
		if(file){
			const rank = this.rank();
			if(rank) return this.game.board.req(`${file}${rank}`);
		}	return null;
	}

	reqSquare(){
		const square = this.square();
		if(square) return square;
		throw MISSING_SQUARE();
	}

	flagCastle(){
		if(this.isCastle){
			const castle = this.char;
			this.next();
			return castle;
		}
	}

	customCastle(){
		if(this.isStartTag){
			this.next();
			const castle = [this.reqSquare(), this.reqSquare(), this.reqSquare(), this.reqSquare()];
			this.endTag();
			return castle;
		}
	}

	castle(){
		return this.flagCastle() ?? this.customCastle();
	}

	castling(){
		const castling = [];
		if(!this.none()){
			let castle;
			while(castle = this.castle())
				castling.push(castle);
			if(castling.length < 1)
				throw MISSING_CASTLING();
		}	return castling;
	}

	enPassant(){
		if(this.none()) return null;
		const square = this.square();
		if(square) return square;
		throw MISSING_ENPASSANT();
	}

	halfmoveClock(){
		if(this.zero()) return 0;
		const halfmoveClock = this.int();
		if(halfmoveClock) return halfmoveClock;
		throw MISSING_FULLMOVENUMBER();
	}

	fullmoveNumber(){
		const fullmoveNumber = this.int();
		if(fullmoveNumber) return fullmoveNumber;
		throw MISSING_FULLMOVENUMBER();
	}

	state(){
		const position = this.position();
		this.trim();
		const color = this.color();
		this.trim();
		const castling = this.castling();
		this.trim();
		const enPassant = this.enPassant();
		this.trim();
		const halfmoveClock = this.halfmoveClock();
		this.trim();
		const fullmoveNumber = this.fullmoveNumber();
		this.trim();
		return {position, color, castling, enPassant, halfmoveClock, fullmoveNumber};
	}

	end(){
		if(!this.isEnd) throw FEN_UNKNOWN_SYMBOL(this.char);
	}
}
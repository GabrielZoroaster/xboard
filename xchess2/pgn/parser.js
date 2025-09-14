
export {PGNParser as Parser, parse}

import {PGNSyntaxError} from './error.js'
import {DEC, NON_ZERO_DEC, TAG_CHARS, FILES, RANKS, PIECES, PROMOTION_PIECES, RESULTS} from './const.js'

function parse(pgn, config){
	return PGNParser.parse(pgn, config);
}

function parseMove(move, config){
	return PGNParser.parseMove(move, config);
}

function CommentsToItems(comments){
	return comments.map(comment => ({type: 'comment', comment}));
}

class PGNParser {

	static parse(pgn, config){
		const parser = new this(pgn, config);
		return parser.parse();
	}

	static parseMove(value, config){
		const parser = new this(value, config);
		return parser.move();
	}

	#source;
	#offset;
	#saved;
	#comments = [];

	constructor(source, {offset = 0} = {}){
		this.#source = String(source);
		this.#offset = Math.trunc(offset);
		this.#saved = this.offset;
	}

	get source(){
		return this.#source;
	}

	get offset(){
		return this.#offset;
	}

	get length(){
		return this.#source.length;
	}

	get saved(){
		return this.#saved;
	}

	get hasNext(){
		return this.offset < this.length;
	}

	get rest(){
		return this.source.substring(this.offset);
	}

	get chunk(){
		return this.source.substring(this.saved, this.offset);
	}

	get char(){
		return this.source[this.offset];
	}

	// Text

	save(){
		this.#saved = this.offset;
	}

	restore(){
		this.#offset = this.saved;
	}

	release(){
		const text = this.chunk;
		this.#saved = this.offset;
		return text;
	}

	// Test

	eq(char){
		return this.char === char;
	}

	not(char){
		return this.char !== char;
	}

	in(chars){
		return chars.includes(this.char);
	}

	test(value){
		return this.source.startsWith(value, this.offset);
	}

	is(value){
		if(this.test(value)){
			this.#offset += value.length;
			return true;
		}	return false;
	}

	enum(... args){
		for(const arg of args)
			if(this.is(arg))
				return arg;
		return null;
	}

	req(char){
		if(this.eq(char))
			this.next();
		else
			this.throw(`Expected '${char}'`);
	}

	// parsing

	throw(message = 'Syntax Error'){
		throw new PGNSyntaxError(message, this);
	}

	next(){
		this.#offset ++;
	}

	find(chars){
		while(true){
			if(!this.hasNext)
				return false;
			if(this.in(chars))
				return true;
			this.next();
		}
	}

	trim(){
		while(this.isWS) this.next();
	}

	// chars

	get isWS(){
		return /\s/.test(this.char);
	}

	get isTagChar(){
		return this.in(TAG_CHARS);
	}

	get isDec(){
		return this.in(DEC);
	}

	get isNonZeroDec(){
		return this.in(NON_ZERO_DEC);
	}

	get isDot(){
		return this.eq('.');
	}

	get isFile(){
		return this.in(FILES);
	}

	get isRank(){
		return this.in(RANKS);
	}

	get isPiece(){
		return this.in(PIECES);
	}

	get isPromotionPiece(){
		return this.in(PROMOTION_PIECES);
	}

	get isCapture(){
		return this.eq('x');
	}

	// parsing

	comments(){
		const comments = [];
		while(true){
			const item = this.comment();
			if(item){
				comments.push(item.comment);
				this.trim();
				continue;
			}	break;
		}	return comments;
	}

	comment(){
		return this.comment1() || this.comment2();
	}

	comment1(){
		if(this.eq('{')){
			this.next();
			this.save();
			this.find('}');
			const type = 'comment';
			const comment = this.release();
			this.req('}');
			return {type, comment};
		} return null;
	}

	comment2(){
		if(this.eq(';')){
			this.next();
			this.save();
			this.find('\r\n');
			const type = 'comment';
			const comment = this.release();
			return {type, comment};
		} return null;
	}

	tags(){
		const tags = {};
		while(this.tag(tags))
			this.trim();
		return tags;
	}

	tag(tags){
		if(this.eq('[')){
			this.next();
			const name = this.name();
			this.trim();
			const value = this.value();
			this.trim();
			this.req(']');
			tags[name] = value;
			return true;
		}	return false;
	}

	name(){
		this.save();
		while(this.isTagChar)
			this.next();
		return this.release();
	}

	value(){
		this.req('"');
		this.save();
		this.find('"');
		const value = this.release();
		this.req('"');
		return value;
	}

	result(){
		return this.enum(... RESULTS);
	}

	movetext(){
		const movetext = [];
		while(true){
			const result = this.result();
			if(result)
				return {movetext, result};
			const item = this.item();
			if(item){
				movetext.push(item);
				if(item.comments)
					movetext.push(... CommentsToItems(item.comments));
				this.trim();
			} else if(movetext.length > 0)
				return {movetext};
			else break;
		}
	}

	item(){
		return this.comment() || this.number() || this.move();
	}

	number(){
		if(this.isNonZeroDec){
			const type = 'number';
			const number = this.int();
			if(this.ellipsis())
				return {type, number, ellipsis: true};
			this.req('.');
			return {type, number};
		}
	}

	int(){
		this.save();
		while(this.isDec)
			this.next();
		return + this.release();
	}

	ellipsis(){
		return this.enum('...', '…');
	}

	file(){
		if(this.isFile){
			const file = this.char;
			this.next();
			return file;
		}
	}

	rank(){
		if(this.isRank){
			const rank = this.char;
			this.next();
			return rank;
		}
	}

	square(){
		const file = this.file();
		const rank = this.rank();
		if(file && rank)
			return file + rank;
		return file || rank || null;
	}

	piece(){
		if(this.isPiece){
			const piece = this.char;
			this.next();
			return piece;
		}	return null;
	}

	capture(){
		if(this.isCapture){
			this.next();
			return true;
		}
		if(this.eq('-'))
			this.next();
		return false;
	}

	promotion(){
		if(this.in('=/')){
			this.next();
			if(this.isPromotionPiece){
				const promotion = this.char;
				this.next();
				return promotion;
			}
			this.throw();
		}	return null;
	}

	suffix(){
		if(this.in('?!')){
			const suffix = this.char;
			this.next();
			if(this.in('?!')){
				const suffix2 = suffix + this.char;
				this.next();
				return suffix2;
			}	return suffix;
		}	return null;
	}

	sanArgs(){
		const args = {};
		if(this.is('+'))
			args.check = true;
		else if(this.is('#'))
			args.checkmate = true;
		const suffix = this.suffix();
		if(suffix)
			args.suffix = suffix;
		return args;
	}

	longCastling(){
		if(this.is('O-O-O') || this.is('0-0-0'))
			return {castling: true, longCastling: true};
	}

	shortCastling(){
		if(this.is('O-O') || this.is('0-0'))
			return {castling: true, shortCastling: true};
	}

	castling(){
		return this.longCastling() || this.shortCastling()
	}

	san(){
		const piece = this.piece();
		const from = this.square();
		const capture = this.capture();
		const to = this.square();
		if(piece || from || capture){
			const promotion = this.promotion();
			if(promotion)
				return {piece, from, to, capture, promotion};
			return {piece, from, to, capture};
		}
	}

	move(){
		this.save();
		const san = this.castling() || this.san();
		if(san){
			const type = 'move';
			const sanArgs = this.sanArgs();
			const move = this.release();
			this.trim();
			const moveArgs = this.moveArgs();
			return {type, move, ... san, ... sanArgs, ... moveArgs};
		} this.restore();
	}

	nag(nags){
		if(this.eq('$')){
			this.next();
			if(this.isDec){
				nags.push(this.int());
				return true;
			} this.throw(`expected a decimal digit, but found '${this.char}'`);
		}	return false;
	}

	nags(){
		const nags = [];
		while(this.nag(nags))
			this.trim();
		return nags;
	}

	rav(ravs){
		if(this.eq('(')){
			this.next();
			const moves = [];
			while(true){
				const move = this.item();
				if(move){
					moves.push(move);
					if(move.comments)
						moves.push(... CommentsToItems(move.comments));
					this.trim();
				} else break;
			}
			this.req(')');
			if(moves.length > 0)
				ravs.push(moves);
			return true;
		}	return false;
	}

	ravs(){
		const ravs = [];
		while(this.rav(ravs))
			this.trim();
		return ravs;
	}

	moveArgs(){
		const comments = [];
		comments.push(... this.comments());
		const nags = this.nags();
		comments.push(... this.comments());
		const ravs = this.ravs();
		comments.push(... this.comments());
		return {nags, ravs, comments};
	}

	game(){
		this.trim();
		const comments = this.comments();
		const tags = this.tags();
		this.trim();
		const movetext = this.movetext();
		if(movetext)
			return {tags, comments, ... movetext};
		return null;
	}

	games(){
		const games = [];
		while(this.hasNext){
			this.trim();
			const game = this.game();
			if(game) games.push(game);
			else break;
		}	return games;
	}

	end(){
		if(this.hasNext)
			this.throw(`unexpected token '${this.char}'`);
	}

	parse(){
		const games = this.games();
		this.end();
		return games;
	}
}
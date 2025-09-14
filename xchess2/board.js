
export {Board, board64}

import {File} from './file.js'
import {Rank} from './rank.js'
import {Square} from './square.js'
import {BoardToText} from './ascii.js'
import {IS_OBJECT, IS_ARRAY} from './types.js'
import {
	INVALID_BOARD,
	INVALID_SQUARE,
	INVALID_FILE,
	INVALID_RANK,
	INVALID_BOARD_WIDTH,
	INVALID_BOARD_HEIGHT,
	NEGATIVE_BOARD_WIDTH,
	NEGATIVE_BOARD_HEIGHT,
	BOARD_PACK_OVERFLOW,
	INVALID_BOARD_PACK_STRING,
} from './errors.js'

const LOG_MAX_SAFE_INTEGER = Math.log(Number.MAX_SAFE_INTEGER);

function ValidateWidth(width) {
  if (!Number.isSafeInteger(width))
    throw INVALID_BOARD_WIDTH(width);
  if (width < 0)
    throw NEGATIVE_BOARD_WIDTH(width);
  return width;
}

function ValidateHeight(height) {
  if (!Number.isSafeInteger(height))
		throw INVALID_BOARD_HEIGHT(height);
  if (height < 0)
		throw NEGATIVE_BOARD_HEIGHT(height);
  return height;
}

function Int10Length(value){
	if(value > 0)
		return Math.floor(Math.log10(Math.abs(value))) + 1;
	return 0;
}

function MaxFileLength(board){
	if(board.files.length > 0)
		return board.files[board.width - 1].name.length;
	return 0;
}

function MaxPackedLength(size){
	return Math.floor(LOG_MAX_SAFE_INTEGER / Math.log(size));
}

function From(board){
	if(board instanceof Board)
		return board;
	if(IS_ARRAY(board)){
		const [width = 8, height = 8] = board;
		return new Board(width, height);
	}
	if(IS_OBJECT(board)){
		const {width = 8, height = 8} = board;
		return new Board(width, height);
	}	throw INVALID_BOARD(board);
}

function RandOF(types){
	return types[Math.floor(Math.random() * types.length)];
}

class Board {

	static from(board){
		return From(board);
	}

	#width;
	#height;
	#width10Length;
	#height10Length;
	#maxFileLength;
	#maxPackedLength;
	#ranks = [];
	#files = [];
	#ranksReversed;
	#filesReversed;
	#squares = [];
	#rankMap = new Map();
	#fileMap = new Map();
	#squareMap = new Map();

	constructor(width, height){

		this.#width = ValidateWidth(width);
		this.#height = ValidateHeight(height);
		this.#width10Length = Int10Length(this.width);
		this.#height10Length = Int10Length(this.height);

		for(let x = 0; x < width; x ++){
			const file = new File(this, x);
			this.#fileMap.set(file, file);
			this.#fileMap.set(file.x, file);
			this.#fileMap.set(file.name, file);
			this.#fileMap.set(file.name.toUpperCase(), file);
			this.#files.push(file);
		}

		for(let y = 0; y < height; y ++){
			const rank = new Rank(this, y);
			this.#rankMap.set(rank, rank);
			this.#rankMap.set(rank.y, rank);
			this.#rankMap.set(rank.name, rank);
			this.#ranks.push(rank);
		}

		let squareID = 0;
		for(const rank of this.ranks){
			for(const file of this.files){
				const square = new Square(this, file, rank, squareID ++);
				this.#squareMap.set(square, square);
				this.#squareMap.set(square.id, square);
				this.#squareMap.set(square.iccf, square);
				this.#squareMap.set(square.name, square);
				this.#squareMap.set(square.name.toUpperCase(), square);
				this.#squares.push(square);
				file.squares.push(square);
				rank.squares.push(square);
			}
		}

		this.#filesReversed = [... this.files].reverse();
		this.#ranksReversed = [... this.ranks].reverse();
		this.#maxFileLength = MaxFileLength(this);
		this.#maxPackedLength = MaxPackedLength(this.size);

		for(const file of this.files)
			Object.freeze(file.squares);
		for(const rank of this.ranks)
			Object.freeze(rank.squares);
		Object.freeze(this.#files);
		Object.freeze(this.#ranks);
		Object.freeze(this.#squares);
	}

	get width(){
		return this.#width;
	}

	get height(){
		return this.#height;
	}

	get width10Length(){
		return this.#width10Length;
	}

	get height10Length(){
		return this.#height10Length;
	}

	get maxFileLength(){
		return this.#maxFileLength;
	}

	get maxPackedLength(){
		return this.#maxPackedLength;
	}

	get size(){
		return this.squares.length;
	}

	get files(){
		return this.#files;
	}

	get ranks(){
		return this.#ranks;
	}

	get ranksReversed(){
		return this.#ranksReversed;
	}

	get filesReversed(){
		return this.#filesReversed;
	}

	get squares(){
		return this.#squares;
	}

	// Out

	* [Symbol.iterator](){
		yield * this.squares;
	}

	text(cellCb){
		return BoardToText(this, cellCb);
	}

	stats(){
		return {width: this.width, height: this.height};
	}

	// Files

	file(value){
		return this.#fileMap.get(value);
	}

	hasFile(value){
		return this.#fileMap.has(value);
	}

	reqFile(value){
		const file = this.file(value);
		if(file) return file;
		throw INVALID_FILE(value);
	}

	// Ranks

	rank(value){
		return this.#rankMap.get(value);
	}

	hasRank(value){
		return this.#rankMap.has(value);
	}

	reqRank(value){
		const rank = this.rank(value);
		if(rank) return rank;
		throw INVALID_RANK(value);
	}

	// Squares

	at(x, y){
		if((x >= 0) && (y >= 0) && (x < this.width) && (y < this.height))
			return this.squares[y * this.width + x];
		return null;
	}

	get(value){
		return this.#squareMap.get(value);
	}

	has(value){
		return this.#squareMap.has(value);
	}

	req(value){
		const square = this.#squareMap.get(value);
		if(square) return square;
		throw INVALID_SQUARE(value);
	}

	rand(){
		return RandOF(this.#squares);
	}

	pack(... squares){
		if(squares.length > this.maxPackedLength)
			throw BOARD_PACK_OVERFLOW(this.maxPackedLength);
		let value = 0;
		for(const square of squares){
			value *= this.size;
			value += this.req(square);
		}	return value;
	}

	unpack(value, length){
		const squares = Array(length);
		for(let i = squares.length - 1; i >= 0; i --){
			const square = value % this.size;
			squares[i] = this.get(square);
			value = (value - square) / this.size;
		}	return squares;
	}

	packString(... squares){
		return [... squares.map(square => this.req(square))].join('');
	}

	unpackString(value){
		const squares = [];
		let length = 0;
		const matches = String(value).matchAll(/[a-wyz]+[1-9][0-9]*/gi);
		for(const [match] of matches){
			const square = this.get(match);
			if(square){
				squares.push(this.req(square));
				length += match.length;
			} else	throw INVALID_BOARD_PACK_STRING(value);
		}
		if(value.length !== length)
			throw INVALID_BOARD_PACK_STRING(value);
		return squares;
	}
}

const board64 = new Board(8, 8);
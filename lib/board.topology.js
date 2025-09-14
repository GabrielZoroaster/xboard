
import {Color} from '../xchess2/index.js'

export class Topology {

	static from(board, colorArg){
		const color = Color.from(colorArg);
		if(color.isWhite)
			return new WhiteTopology(board);
		if(color.isBlack)
			return new BlackTopology(board);
	}

	#board;

	constructor(board){
		this.#board = board;
	}

	get color(){
		return null;
	}

	get board(){
		return this.#board;
	}

	at(x, y){
		const squareX = Math.floor(x * this.board.width);
		const squareY = Math.floor(y * this.board.height);
		return this.squareAt(squareX, squareY);
	}

	squareAt(x, y){
		return this.board.at(x, y);
	}

	squareWidth(){
		return 1 / this.board.width;
	}

	squareHeight(){
		return 1 / this.board.height;
	}

	squareX(square){
		return this.x(square) / this.board.width;
	}

	squareY(square){
		return this.y(square) / this.board.height;
	}

	x(square){
		return square.x;
	}

	y(square){
		return square.y;
	}

	center(square){
		const target = this.board.req(square);
		const x = this.x(target) + 0.5;
		const y = this.y(target) + 0.5;
		return [x / this.board.width, y / this.board.height];
	}

	distance(from, to){
		const sq1 = this.board.req(from);
		const sq2 = this.board.req(to);
		return Math.hypot(sq1.x - sq2.x, sq1.y - sq2.y);
	}

	angle(from, to){
		const sq1 = this.board.req(from);
		const sq2 = this.board.req(to);
		const dx = this.x(sq2) - this.x(sq1);
		const dy = this.y(sq2) - this.y(sq1);
		return Math.atan2(dy, dx) * 180 / Math.PI;
	}
}

export class WhiteTopology extends Topology {

	get color(){
		return Color.white;
	}
}

export class BlackTopology extends Topology {

	get color(){
		return Color.black;
	}

	squareAt(x, y){
		return this.board.at(this.board.width - x - 1, this.board.height - y - 1);
	}

	x(square){
		return  this.board.width - square.x - 1;
	}

	y(square){
		return  this.board.height - square.y - 1;
	}
}
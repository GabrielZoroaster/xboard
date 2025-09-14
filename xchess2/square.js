
export {Square}

import {Color} from './color.js'
// import {inspect} from 'util'

function SquareName({rank, file}){
	return file.name + rank.name;
}

function SquareICCF({rank, file}){
	return rank.iccf + file.iccf;
}

function SquareColor(square){
	return Color.from(square.a % 2);
}

class Square {

	#board;
	#file;
	#rank;
	#id;
	#name;
	#iccf;
	#color;

	constructor(board, file, rank, id){
		this.#board = board;
		this.#file = file;
		this.#rank = rank;
		this.#id = id;
		this.#name = SquareName(this);
		this.#iccf = SquareICCF(this);
		this.#color = SquareColor(this);
	}

	get board(){
		return this.#board;
	}

	get file(){
		return this.#file;
	}

	get rank(){
		return this.#rank;
	}

	get id(){
		return this.#id;
	}

	get color(){
		return this.#color;
	}

	get name(){
		return this.#name;
	}

	get iccf(){
		return this.#iccf;
	}

	toString(){
		return this.name;
	}

	valueOf(){
		return this.id;
	}

	toJSON(){
		return this.name;
	}

	// [inspect.custom](){
	// 	return `[${this.name.toUpperCase()}]`;
	// }

	// Geo

	get x(){
		return this.file.x;
	}

	get y(){
		return this.rank.y;
	}

	get a(){
		return this.x + this.y;
	}

	get b(){
		return this.x - this.y;
	}

	eq(square){
		return this === this.board.get(square);
	}

	to(dx, dy){
		return this.board.at(this.x + dx, this.y + dy);
	}

	dx(dx){
		return this.board.at(this.x + dx, this.y);
	}

	dy(dy){
		return this.board.at(this.x, this.y + dy);
	}

	* walk(... args){
		for(const [dx, dy] of args){
			const square = this.to(dx, dy);
			if(square) yield square;
		}
	}

	* ray(dx, dy){
		let square = this;
		while(square = square.to(dx, dy))
			yield square;
	}
}
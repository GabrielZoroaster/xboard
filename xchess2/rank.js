
export {Rank}

function RankName(rank){
	return String(rank.board.height - rank.y);
}

function RankICCF(rank){
	return String(rank.board.height - rank.y).padStart(rank.board.height10Length, '0');
}

class Rank {

	#board;
	#y;
	#name;
	#iccf;
	#squares = [];

	constructor(board, y){
		this.#board = board;
		this.#y = y;
		this.#name = RankName(this);
		this.#iccf = RankICCF(this);
	}

	get board(){
		return this.#board;
	}

	get y(){
		return this.#y;
	}

	get name(){
		return this.#name;
	}

	get iccf(){
		return this.#iccf;
	}

	get squares(){
		return this.#squares;
	}

	toString(){
		return this.name;
	}

	valueOf(){
		return this.y;
	}

	eq(rank){
		return this === this.board.rank(rank);
	}
}

export {File}

export function IntTo26(value) {
  const abc = 'abcdefghijklmnopqrstuvwyz';
  let result = '';
  do {
  	const digit = value % abc.length;
    result = abc[digit] + result;
    value = (value - digit) / abc.length - 1;
  } while (value >= 0);
  return result;
}

function FileName(file){
	return IntTo26(file.x);
}

function FileICCF(file){
	return String(file.x + 1).padStart(file.board.width10Length, '0');
}

class File {

	#board;
	#x;
	#name;
	#iccf;
	#squares = [];

	constructor(board, x){
		this.#board = board;
		this.#x = x;
		this.#name = FileName(this);
		this.#iccf = FileICCF(this);
	}

	get board(){
		return this.#board;
	}

	get x(){
		return this.#x;
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
		return this.x;
	}

	eq(file){
		return this === this.board.file(file);
	}
}
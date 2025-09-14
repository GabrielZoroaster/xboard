
export {PGNSyntaxError}

function FindLineAndColumn(source, offset){
	let line = 1;
	let column = 1;
	for(let pos = 0; pos < offset; pos ++){
		const char = source[pos];
		if(char === '\n'){
			line ++;
			column = 1;
		} else if(char === '\r'){
			if(source[pos + 1] == '\n')
				pos ++;
			line ++;
			column = 1;
		} else column ++;
	}	return {line, column};
}

class PGNSyntaxError extends Error {

	#source;
	#offset;
	#line;
	#column;

	constructor(message, {source, offset}){
		const {line, column} = FindLineAndColumn(source, offset);
		super(`${message} (line: ${line}, column: ${column})`);
		this.#source = source;
		this.#offset = offset;
		this.#line = line;
		this.#column = column;
	}

	get source(){
		return this.#source;
	}

	get offset(){
		return this.#offset;
	}

	get line(){
		return this.#line;
	}

	get column(){
		return this.#column;
	}
}
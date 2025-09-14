
function StyleToClassName(style){
	return `highlight-${style}`;
}

function FromObject(board, squares){
	const all = [];
	for(const [square, value] of Object.entries(squares))
		all.push([board.req(square), String(value)]);
	return all;
}

export class HighlightStyleMap extends Map {

	#squares;
	#board;

	constructor(board, squares){
		super();
		this.#squares = squares;
		this.#board = board;
	}

	get(square){
		return super.get(this.#board.get(square));
	}

	has(square){
		return super.has(this.#board.get(square));
	}

	setAll(squaresArg){
		const squares = FromObject(this.#board, squaresArg);
		this.clear();
		for(const [square, style] of squares){
			super.set(square, style);
			this.#squares.mark(square, StyleToClassName(style));
		}	return this;
	}

	set(square, styleArg){
		const key = this.#board.req(square);
		const style = String(styleArg);
		if(super.has(key)){
			const style = super.get(key);
			this.#squares.unmark(key, StyleToClassName(style));
		}
		this.#squares.mark(key, StyleToClassName(style));
		super.set(key, style);
	}

	delete(square){
		const key = this.#board.get(square);
		if(super.has(key)){
			const style = super.get(key);
			this.#squares.unmark(key, StyleToClassName(style));
			return true;
		}	return false;
	}

	clear(){
		for(const [square, style] of this)
			this.#squares.unmark(square, StyleToClassName(style));
		super.clear();
	}
}

import {Node} from './node.js'

export class BoardNode extends Node {

	#context;

	constructor(context){
		super();
		this.#context = context;
	}

	get context(){
		return this.#context;
	}

	get topology(){
		return this.#context.topology;
	}
}
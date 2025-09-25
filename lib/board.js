
import {Node} from './node.js'
import {Context} from './board.context.js'

export class Board extends Node {

	#context;

	constructor(config = {}){
		super();
		this.#context = new Context(this, config);
		this.class.add('xboard');
	}

	get context(){
		return this.#context;
	}

	// Read

	get game(){
		return this.#context.game;
	}

	get side(){
		return this.#context.side;
	}

	get color(){
		return this.#context.color;
	}

	get bus(){
		return this.#context.bus;
	}

	get displayMoves(){
		return this.#context.displayMoves;
	}

	get displayCheck(){
		return this.#context.displayCheck;
	}

	get displayMove(){
		return this.#context.displayMove;
	}

	get editLocked(){
		return this.#context.editLocked;
	}

	get rules(){
		return this.style.getPropertyValue('--rules');
	}

	get ruleSize(){
		return this.style.getPropertyValue('--rule-size');
	}

	get highlight(){
		return this.#context.squares.highlight;
	}

	get arrows(){
		return this.#context.arrows;
	}

	get source(){
		return this.#context.source;
	}

	// Write

	set game(game){
		this.#context.game = game;
	}

	set side(value){
		this.#context.side = value;
	}

	set color(value){
		this.#context.color = value;
	}

	set displayMoves(value){
		this.#context.displayMoves = value;
	}

	set displayCheck(value){
		this.#context.displayCheck = value;
	}

	set displayMove(value){
		this.#context.displayMove = value;
	}

	set editLocked(value){
		this.#context.editLocked = value;
	}

	set rules(value){
		return this.style.setProperty('--rules', value);
	}

	set ruleSize(value){
		return this.style.setProperty('--rule-size', value);
	}

	set source(square){
		if(square === null)
			this.#context.clearSource();
		else {
			this.#context.setSource(square);
		}
	}

	// User Events

	flip(){
		this.color = this.color.invert();
	}
}
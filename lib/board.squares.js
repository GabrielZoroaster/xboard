
import {BoardNode} from './board.node.js'
import {HighlightStyleMap} from './board.highlight.js'

export class SquareNode extends BoardNode {

	#square;

	constructor(context, square){
		super(context);
		this.#square = square;
		this.class.add('square');
		this.class.add(square.color);
		this.class.add(square);
		this.on('pointerdown', event => this.touch(event));
	}

	get square(){
		return this.#square;
	}

	sync(){
		this.style.setProperty('--x', this.topology.x(this.square) + 1);
		this.style.setProperty('--y', this.topology.y(this.square) + 1);
	}

	touch(event){
		this.context.touchSquare(this, event);
	}

	// Mark

	mark(tag){
		this.class.add(tag);
	}

	unmark(tag){
		this.class.remove(tag);
	}

	toggleMark(tag){
		this.class.toggle(tag);
	}
}

export class SquareSet extends BoardNode {

	#map = new Map();
	#lastMove = null;
	#moves = null;
	#checks = null;
	#source = null;
	#target = null;
	#highlight = null;

	constructor(context){
		super(context);
		this.class.add('squares');
	}

	get lastMove(){
		return this.#lastMove;
	}

	get moves(){
		return this.#moves;
	}

	get checks(){
		return this.#checks;
	}

	get source(){
		return this.#source;
	}

	get target(){
		return this.#target;
	}

	get highlight(){
		return this.#highlight;
	}

	// Board

	clear(){
		this.#map.clear();
		this.ls.clear();
		this.#lastMove = null;
		this.#moves = null;
		this.#checks = null;
		this.#source = null;
		this.#target = null;
		this.#highlight = null;
	}

	fill(board){
		for(const square of board)
			this.#add(square);
		this.#highlight = new HighlightStyleMap(board, this);
	}

	sync(){
		for(const squareNode of this.ls)
			squareNode.sync();
	}

	#add(square){
		const squareNode = new SquareNode(this.context, square);
		this.#map.set(square, squareNode);
		this.append(squareNode);
		squareNode.sync();
	}

	// Square Nodes

	get(square){
		return this.#map.get(this.topology.board.req(square));
	}

	has(square){
		return this.#map.has(this.topology.board.get(square));
	}

	// Mark

	mark(square, tag){
		this.get(square).mark(tag);
	}

	unmark(square, tag){
		this.get(square).unmark(tag);
	}

	toggleMark(square, tag){
		this.get(square).toggleMark(tag);
	}

	markAll(tag){
		for(const squareNode of this.ls)
			squareNode.mark(tag);
	}

	unmarkAll(tag){
		for(const squareNode of this.ls)
			squareNode.unmark(tag);
	}

	// Last Move

	showMove(move){
		this.hideMove();
		this.#lastMove = move;
		if(this.lastMove.from)
			this.mark(this.lastMove.from, 'from');
		if(this.lastMove.to)
			this.mark(this.lastMove.to, 'to');
	}

	hideMove(){
		if(this.lastMove){
			if(this.lastMove.from)
				this.unmark(this.lastMove.from, 'from');
			if(this.lastMove.to)
				this.unmark(this.lastMove.to, 'to');
			this.#lastMove = null;
		}
	}

	// Moves

	showMoves(moves){
		this.hideMoves();
		this.#moves = moves;
		for(const move of this.moves){
			if(move.to)
				this.mark(move.to, 'move');
			if(move.capturedAt)
				this.mark(move.capturedAt, 'capture');
		}
	}

	hideMoves(){
		if(this.moves){
			for(const move of this.moves){
				if(move.to)
					this.unmark(move.to, 'move');
				if(move.capturedAt)
					this.unmark(move.capturedAt, 'capture');
			}
			this.#moves = null;
		}
	}

	// Checks

	showChecks(squares){
		this.hideChecks();
		this.#checks = squares;
		for(const square of this.checks)
			this.mark(square, 'check');
	}

	hideChecks(){
		if(this.checks){
			for(const square of this.checks)
				this.unmark(square, 'check');
			this.#checks = null;
		}
	}

	// Source

	showSource(square){
		if(this.source !== square){
			this.hideSource();
			this.#source = square
			this.mark(this.source, 'source');
		}
	}

	hideSource(){
		if(this.source){
			this.unmark(this.source, 'source');
			this.#source = null;
		}
	}

	// Target

	showTarget(square){
		if(this.target !== square){
			this.hideTarget();
			this.#target = square;
			this.mark(this.target, 'target');
		}
	}

	hideTarget(){
		if(this.target){
			this.unmark(this.target, 'target');
			this.#target = null;
		}
	}
}
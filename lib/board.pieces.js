
import {BoardNode} from './board.node.js'

function Persent(value){
	return `${value * 100}%`;
}

function PX(value){
	return `${value}px`;
}

export class PieceNode extends BoardNode {

	#piece;
	#square;

	constructor(context, piece, square){
		super(context);
		this.#piece = piece;
		this.#square = square;
		this.class.add('piece');
		this.class.add(this.piece.color);
		this.class.add(this.piece.id);
		this.#syncSize();
		this.syncLock();
		this.on('pointerdown', event => this.touch(event));
	}

	get piece(){
		return this.#piece;
	}

	get square(){
		return this.#square;
	}

	get isLocked(){
		return this.context.isLockedPiece(this.piece);
	}

	get transfer(){
		return this.class.contains('transfer');
	}

	move(to){
		const square = this.topology.board.req(to);
		if(this.square !== square){
			this.#square = square;
			this.sync();
		}
	}

	#syncSize(){
		this.style.width = Persent(this.topology.squareWidth());
		this.style.height = Persent(this.topology.squareHeight());
	}

	#sync(){
		this.style.left = Persent(this.topology.squareX(this.square));
		this.style.top = Persent(this.topology.squareY(this.square));
	}

	sync(){
		this.transfer || this.#sync();
	}

	syncLock(){
		this.isLocked ? this.mark('locked') : this.unmark('locked');
	}

	at(event){
		const pieces = this.context.pieces.vp;
		const piece = this.vp;
		const x = event.clientX - pieces.x - piece.width / 2;
		const y = event.clientY - pieces.y - piece.height / 2;
		return [x, y];
	}

	drag(event){
		this.class.add('transfer');
		this.dragTo(event);
	}

	dragTo(event){
		const [x, y] = this.at(event);
		this.style.left = PX(x);
		this.style.top = PX(y);
	}

	jump(event){
		this.drag(event);
		setTimeout(() => this.drop(), 0);
	}

	drop(){
		if(this.transfer){
			this.class.remove('transfer');
			this.#sync();
		}
	}

	touch(event){
		this.context.touchPiece(this, event);
	}

	click(event){
		this.context.clickPiece(this, event);
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

export class PieceSet extends BoardNode {

	#map = new Map();
	#checks = null;
	#source = null;

	constructor(context){
		super(context);
		this.class.add('pieces');
	}

	get checks(){
		return this.#checks;
	}

	get source(){
		return this.#source;
	}

	fill(position){
		for(const [square, piece] of position)
			this.set(piece, square);
	}

	sync(){
		for(const pieceNode of this.ls)
			pieceNode.sync();
	}

	syncLock(){
		for(const pieceNode of this.ls)
			pieceNode.syncLock();
	}

	clear(){
		this.#map.clear();
		this.ls.clear();
		this.#checks = null;
		this.#source = null;
	}

	set(piece, square){
		const pieceNode = this.get(piece);
		if(pieceNode)
			pieceNode.move(square);
		else {
			const pieceNode = new PieceNode(this.context, piece, square);
			this.#map.set(piece, pieceNode);
			this.append(pieceNode);
			pieceNode.sync();
		}
	}

	delete(piece){
		const pieceNode = this.get(piece);
		if(pieceNode){
			this.#map.delete(pieceNode.piece);
			pieceNode.remove();
		}
	}

	has(piece){
		return this.#map.has(piece);
	}

	get(piece){
		return this.#map.get(piece);
	}

	move(piece, to){
		const pieceNode = this.get(piece);
		if(pieceNode) pieceNode.move(to);
	}

	// Mark

	mark(piece, tag){
		const pieceNode = this.get(piece);
		if(pieceNode) pieceNode.mark(tag);
	}

	unmark(piece, tag){
		const pieceNode = this.get(piece);
		if(pieceNode) pieceNode.unmark(tag);
	}

	toggleMark(piece, tag){
		const pieceNode = this.get(piece);
		if(pieceNode) pieceNode.toggleMark(tag);
	}

	markAll(tag){
		for(const pieceNode of this.ls)
			pieceNode.mark(tag);
	}

	unmarkAll(tag){
		for(const pieceNode of this.ls)
			pieceNode.unmark(tag);
	}

	// Checks

	showChecks(pieces){
		this.hideChecks();
		for(const piece of pieces)
			this.mark(piece, 'check');
		this.#checks = pieces;
	}

	hideChecks(){
		if(this.checks){
			for(const piece of this.checks)
				this.unmark(piece, 'check');
			this.#checks = null;
		}
	}

	// Source

	showSource(piece){
		if(this.source !== piece){
			this.blur();
			this.#source = piece;
			this.mark(this.source, 'source');
		}
	}

	hideSource(){
		if(this.source){
			this.unmark(this.source, 'source');
			this.#source = null;
		}
	}
}
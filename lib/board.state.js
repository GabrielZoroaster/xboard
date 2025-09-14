
import {BoardDragProvider} from './board.transfer.js'

export class BoardState {

	#context;

	constructor(context){
		this.#context = context;
	}

	get context(){
		return this.#context;
	}

	get game(){
		return this.#context.game;
	}

	get side(){
		return this.#context.side;
	}

	get topology(){
		return this.#context.topology;
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

	get source(){
		return this.#context.source;
	}

	get sourcePiece(){
		return this.#context.sourcePiece;
	}

	get board(){
		return this.#context.board;
	}

	get grid(){
		return this.#context.grid;
	}

	get squares(){
		return this.#context.squares;
	}

	get pieces(){
		return this.#context.pieces;
	}

	get arrows(){
		return this.#context.arrows;
	}

	get rules(){
		return this.#context.rules;
	}

	get dialog(){
		return this.#context.dialog;
	}

	// Stats

	isLockedPiece(piece){
		return false;
	}

	canImport(piece, square){
		// abstract
	}

	canMove(piece, square){
		// abstract
	}

	canExport(piece){
		// abstract
	}

	// User Events

	init(){
		// abstract
	}

	destroy(){
		// abstract
	}

	syncEditLocked(){
		// abstract
	}

	syncSide(){
		// abstract
	}

	syncMoves(){
		// abstract
	}

	syncCheck(){
		// abstract
	}

	syncMove(){
		// abstract
	}

	syncSource(){
		// abstract
	}

	// Game Events

	onInsert(event){
		this.pieces.set(event.piece, event.square);
		if(event.square === this.source)
			this.context.clearSource();
	}

	onRemove(event){
		this.pieces.delete(event.piece);
		if(event.square === this.source)
			this.context.clearSource();
	}

	onTransfer(event){
		this.pieces.move(event.piece, event.to);
		if(event.from === this.source)
			this.context.clearSource();
		if(event.to === this.source)
			this.context.clearSource();
	}

	onClear(event){
		this.pieces.clear();
		this.context.clearSource();
	}

	onSeek(){
		// abstract
	}

	onState(){
		// abstract
	}

	onPlay(){
		// abstract
	}

	onMove(move){
		// abstract
	}

	onPromotion(promotes){
		// abstract
	}


	// UI Events

	touchPiece(pieceNode, event){
		// abstract
	}

	clickPiece(pieceNode, event){
		// abstract
	}

	touchSquare(squareNode, event){
		// abstract
	}

	move(from, to){
		// abstract
	}

	import(piece, square, event){
		// abstract
	}
}

export class SetupState extends BoardState {

	isLockedPiece(piece){
		return this.editLocked;
	}

	canImport(piece, square){
		return !this.editLocked;
	}

	canExport(piece){
		return !this.editLocked;
	}

	canMove(piece, square){
		return !this.editLocked;
	}

	// User Events

	init(){
		this.board.class.add('setup-mode');
	}

	destroy(){
		this.board.class.remove('setup-mode');
	}

	syncEditLocked(){
		this.pieces.syncLock();
	}

	// UI Events

	touchPiece(pieceNode, event){
		if(!this.editLocked){
			this.context.setSource(pieceNode.square);
			this.bus.drag.publish(new BoardDragProvider(pieceNode), event);
		}
	}

	touchSquare(squareNode, event){
		if(this.source && this.sourcePiece){
			this.move(this.source, squareNode.square);
		} else {
			this.context.clearSource();
			if(!this.editLocked && this.bus.pick.isInsert()){
				const piece = this.bus.pick.release();
				this.game.position.set(squareNode.square, piece);
			}
		}
	}

	clickPiece(pieceNode, event){
		if(!this.editLocked){
			if(this.bus.pick.isInsert()){
				const piece = this.bus.pick.release();
				this.game.position.set(pieceNode.square, piece);
			} else if(this.bus.pick.isDelete()){
				this.game.position.delete(pieceNode.square);
			}
		}
	}

	move(from, to){
		this.game.position.move(from, to);
	}

	import(piece, square, event){
		this.game.position.set(square, piece);
		const pieceNode = this.pieces.get(piece);
		if(pieceNode) pieceNode.jump(event);
	}
}

export class PlayState extends BoardState {

	isLockedPiece(piece){
		return piece.isLocked || !this.side.has(piece.color);
	}

	canImport(piece, square){
		return false;
	}

	canExport(piece){
		return false;
	}

	canMove(piece, square){
		return this.hasMovesAt(piece, square);
	}

	hasMovesAt(piece, square){
		if(piece){
			for(const move of this.game.moves.of(piece))
				if(move.to === square)
					return true;
		}	return false;
	}

	canSourceMove(square){
		const piece = this.sourcePiece;
		if(piece) return this.hasMovesAt(piece, square);
		return false;
	}

	// User Events

	init(){
		this.board.class.add('play-mode');
		this.syncCheck();
		this.syncMove();
		this.syncPromotion();
	}

	destroy(){
		this.board.class.remove('play-mode');
	}

	syncSide(){
		this.pieces.syncLock();
		const piece = this.sourcePiece;
		if(piece && this.isLockedPiece(piece))
			this.context.clearSource();
	}

	syncMoves(){
		const piece = this.sourcePiece;
		if(this.displayMoves && piece)
			this.squares.showMoves(this.game.moves.of(piece));
		else
			this.squares.hideMoves();
	}

	syncCheck(){
		const squares = this.game.checkSquares;
		if(this.displayCheck && squares && squares.length > 0){
			this.squares.showChecks(squares);
			this.pieces.showChecks(squares.map(square => this.game.position.get(square)));
		} else {
			this.squares.hideChecks();
			this.pieces.hideChecks();
		}
	}

	syncMove(){
		if(this.displayMove && this.game.lastMove)
			this.squares.showMove(this.game.lastMove)
		else this.squares.hideMove();
	}

	syncSource(){
		this.syncMoves();
	}

	syncPromotion(){
		if(this.game.isPromotion){
			const promotes = this.game.lastMove.promotes;
			const color = this.game.color;
			this.dialog.promotion(promotes, color);
		} else this.dialog.close();
	}

	// Game Events

	onSeek(){
		this.pieces.clear();
		this.pieces.fill(this.game.position);
		this.syncMove();
		this.syncCheck();
		this.syncPromotion();
		this.context.clearSource();
	}

	onState(){
		this.syncMove();
		this.syncCheck();
		this.syncPromotion();
		this.context.clearSource();
	}

	onPromotion(promotes){
		this.dialog.promotion(promotes, this.game.color);
	}

	// UI Events

	touchPiece(pieceNode, event){
		if(this.canSourceMove(pieceNode.square))
			this.move(this.source, pieceNode.square);
		else if(this.isLockedPiece(pieceNode.piece))
			this.context.clearSource();
		else {
			this.context.setSource(pieceNode.square);
			this.bus.drag.publish(new BoardDragProvider(pieceNode), event);
		}
	}

	touchSquare(squareNode, event){
		if(this.canSourceMove(squareNode.square))
			this.move(this.source, squareNode.square);
		else
			this.context.clearSource();
	}

	move(from, to){
		this.game.move({from, to});
	}
}

import {Game, ColorSet, Color} from '../xchess2/index.js'
import {Topology} from './board.topology.js'
import {Grid} from './board.grid.js'
import {SquareSet} from './board.squares.js'
import {PieceSet} from './board.pieces.js'
import {ArrowSet} from './board.arrows.js'
import {RuleSet} from './board.rules.js'
import {Dialog} from './board.dialog.js'
import {SetupState, PlayState} from './board.state.js'
import {GlobalBus, TransferBus} from './transfer.js'
import {BoardDragReceiver} from './board.transfer.js'

const DefaultSide = Color.white;

function StateFrom(context){
	if(context.game.isSetup)
		return new SetupState(context);
	return new PlayState(context);
}

class Side extends ColorSet {

	#context;

	constructor(context, value = context.game.color){
		super(value);
		this.#context = context;
	}

	get context(){
		return this.#context;
	}

	onChange(){
		this.context.syncSide();
	}
}

export class Context {

	#board;
	#game;
	#state;
	#side;
	#topology;
	#displayMoves;
	#displayCheck;
	#displayMove;
	#editLocked;
	#bus;
	#receiver;

	#grid = new Grid(this);
	#squares = new SquareSet(this);
	#pieces = new PieceSet(this);
	#arrows = new ArrowSet(this);
	#rules = new RuleSet(this);
	#dialog = new Dialog(this);

	#source = null;

	constructor(board, {
		game = new Game(),
		color = Color.white,
		side = DefaultSide,
		bus = GlobalBus,
		displayMoves = true,
		displayCheck = true,
		displayMove = true,
		editLocked = false,
	}){
		this.#board = board;
		this.#game = Game.from(game);
		this.#state = StateFrom(this);
		this.#side = new Side(this, side);
		this.#topology = Topology.from(this.game.board, color);
		this.#bus = TransferBus.from(bus);
		this.#receiver = new BoardDragReceiver(this);
		this.#displayMoves = Boolean(displayMoves);
		this.#displayCheck = Boolean(displayCheck);
		this.#displayMove = Boolean(displayMove);
		this.#editLocked = Boolean(editLocked);
		this.render();
	}

	// UI

	get board(){
		return this.#board;
	}

	get grid(){
		return this.#grid;
	}

	get squares(){
		return this.#squares;
	}

	get pieces(){
		return this.#pieces;
	}

	get arrows(){
		return this.#arrows;
	}

	get rules(){
		return this.#rules;
	}

	get dialog(){
		return this.#dialog;
	}

	// Options

	get game(){
		return this.#game;
	}

	get state(){
		return this.#state;
	}

	get side(){
		return this.#side;
	}

	get topology(){
		return this.#topology;
	}

	get color(){
		return this.#topology.color;
	}

	get bus(){
		return this.#bus;
	}

	get displayMoves(){
		return this.#displayMoves;
	}

	get displayCheck(){
		return this.#displayCheck;
	}

	get displayMove(){
		return this.#displayMove;
	}

	get editLocked(){
		return this.#editLocked;
	}

	get source(){
		return this.#source;
	}

	get sourcePiece(){
		if(this.source)
			return this.game.position.get(this.source);
		return null;
	}

	// Write Options

	set game(value){
		const game = Game.from(value);
		if(this.game !== game)
			this.setGame(game);
	}

	set color(value){
		const color = Color.from(value);
		if(this.color !== color)
			this.setColor(color);
	}

	set side(value){
		this.#side.setAll(value);
	}

	set displayMoves(value){
		const displayMoves = Boolean(value);
		if(this.displayMoves !== displayMoves){
			this.#displayMoves = displayMoves;
			this.state.syncMoves();
		}
	}

	set displayCheck(value){
		const displayCheck = Boolean(value);
		if(this.displayCheck !== displayCheck){
			this.#displayCheck = displayCheck;
			this.state.syncCheck();
		}
	}

	set displayMove(value){
		const displayMove = Boolean(value);
		if(this.displayMove !== displayMove){
			this.#displayMove = displayMove;
			this.state.syncMove();
		}
	}

	set editLocked(value){
		const editLocked = Boolean(value);
		if(this.editLocked !== editLocked){
			this.#editLocked = editLocked;
			this.state.syncEditLocked();
		}
	}

	// Stats

	isLockedPiece(piece){
		return this.state.isLockedPiece(piece);
	}

	canImport(piece, square){
		return this.state.canImport(piece, square);
	}

	canExport(piece){
		return this.state.canExport(piece);
	}

	canMove(piece, square){
		return this.state.canMove(piece, square);
	}

	at(event){
		const rect = this.squares.vp;
		const x = (event.clientX - rect.left) / rect.width;
		const y = (event.clientY - rect.top) / rect.height;
		return this.topology.at(x, y);
	}

	// User Events

	render(){
		this.board.append(this.grid, this.rules, this.dialog);
		this.grid.append(this.squares, this.arrows, this.pieces);
		this.game.subscribe(this);
		this.rules.fill(this.game.board);
		this.squares.fill(this.game.board);
		this.pieces.fill(this.game.position);
		this.setBoard(this.game.board);
		this.state.init();
	}

	setGame(game){
		// Clear
		this.game.unsubscribe(this);
		this.rules.clear();
		this.squares.clear();
		this.pieces.clear();
		this.arrows.clear();
		this.dialog.close();
		this.state.destroy();
		// Insert
		this.#game = game;
		this.#topology = Topology.from(this.game.board, this.color);
		this.#state = StateFrom(this);
		this.game.subscribe(this);
		// Fill
		this.rules.fill(this.game.board);
		this.squares.fill(this.game.board);
		this.pieces.fill(this.game.position);
		this.setBoard(this.game.board);
		this.state.init();
	}

	setBoard(board){
		this.board.style.setProperty('--cols', board.width);
		this.board.style.setProperty('--rows', board.height);
	}

	setColor(color){
		this.#topology = Topology.from(this.game.board, color);
		this.rules.sync();
		this.squares.sync();
		this.pieces.sync();
		this.arrows.sync();
	}

	syncSide(){
		this.state.syncSide();
	}

	// Game Events

	emit(eventType, event){
		switch(eventType){
			case 'insert': return this.state.onInsert(event);
			case 'remove': return this.state.onRemove(event);
			case 'transfer': return this.state.onTransfer(event);
			case 'clear': return this.state.onClear(event);
			case 'seek-state': return this.state.onSeek(event);
			case 'state': return this.state.onState(event);
			case 'move': return this.state.onMove(event);
			case 'promotion': return this.state.onPromotion(event);
			case 'play': return this.onPlay(event);
		}
	}

	onPlay(){
		this.clearSource();
		this.state.destroy();
		this.#state = new PlayState(this);
		this.state.init();
		this.pieces.syncLock();
	}

	// UI Events

	touchPiece(pieceNode, event){
		this.state.touchPiece(pieceNode, event);
	}

	touchSquare(squareNode, event){
		this.state.touchSquare(squareNode, event);
	}

	clickPiece(pieceNode, event){
		this.state.clickPiece(pieceNode, event);
	}

	move(from, to){
		this.state.move(from, to);
	}

	import(piece, square, event){
		this.state.import(piece, square, event);
	}

	// State Events

	setSource(square){
		if(this.source !== square){
			this.squares.hideSource();
			this.#source = square;
			this.squares.showSource(this.source);
			this.state.syncSource();
		}
	}

	clearSource(){
		if(this.source){
			this.squares.hideSource();
			this.#source = null;
			this.state.syncSource();
		}
	}
}
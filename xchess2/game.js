
import {Emitter} from './emitter.js'
import {Color} from './color.js'
import {Board, board64} from './board.js'
import {Bestiary, chess} from './bestiary.js'
import {RuleEngine, chessRules} from './rules.js'
import {TagMap} from './tags.js'
import {IS_STRING, IS_OBJECT} from './types.js'
import {SetupState} from './event.setup.js'
import {StartState} from './event.start.js'
import {GameOverEvent, DrawOfferEvent, NagEvent, CommentEvent} from './event.meta.js'
import {Forfeit, DrawByResignation, Resignation, DrawOnTime, WinOnTime, DrawByAgreement, ThreefoldRepetition, FiftyMoves} from './result.js'
import {GameToPGN} from './game.pgn.js'

import {
	INVALID_GAME_CONFIG,
	PLAY_LOCKED,
	MOVE_LOCKED,
	PROMOTE_LOCKED,
	META_LOCKED,
	GAME_OVER,
} from './errors.js'

export const NextEvent = new WeakMap();
export const Next = new WeakMap();

export class Game extends Emitter {

	static is(game){
		return game instanceof Game;
	}

	static from(game){
		if(Game.is(game)) return game;
		return new Game(game);
	}

	#board;
	#bestiary;
	#rules;
	#tags;
	#current;
	#first = null;
	#last = null;

	constructor(config){
		super();
		this.#setConfig(config);
	}

	#setConfig(config = {}){
		if(IS_STRING(config))
			this.#setAsFEN(config);
		else if(Game.is(config))
			this.#setAsGame(config);
		else if(IS_OBJECT(config))
			this.#setAsObject(config);
		else throw INVALID_GAME_CONFIG(config);
	}

	#setAsObject({
		board = board64,
		bestiary = chess,
		rules = chessRules,
		tags = [],
		... state
	}){
		this.#board = Board.from(board);
		this.#bestiary = Bestiary.from(bestiary);
		this.#rules = RuleEngine.from(rules);
		this.#tags = TagMap.from(tags);
		this.#current = SetupState.from(this, state);
	}

	#setAsGame(game){
		this.#board = game.#board;
		this.#bestiary = game.#bestiary;
		this.#rules = game.#rules;
		this.#tags = new TagMap(game.#tags);
		this.#current = SetupState.fromGame(this, game);
	}

	#setAsFEN(fen){
		this.#board = board64;
		this.#bestiary = chess;
		this.#rules = chessRules;
		this.#tags = new TagMap();
		this.#current = SetupState.fromFen(this, fen);
	}

	// Game

	get board(){
		return this.#board;
	}

	get bestiary(){
		return this.#bestiary;
	}

	get rules(){
		return this.#rules;
	}

	get tags(){
		return this.#tags;
	}

	get current(){
		return this.#current;
	}

	get first(){
		return this.#first;
	}

	get last(){
		return this.#last;
	}

	// Event

	get time(){
		return this.#current.time;
	}

	get prevEvent(){
		return this.#current.prevEvent;
	}

	get nextEvent(){
		return this.#current.nextEvent;
	}

	get eventID(){
		return this.#current.eventID;
	}

	get status(){
		return this.#current.type;
	}

	get state(){
		return this.#current.state;
	}

	get ply(){
		return this.#current.ply;
	}

	get result(){
		return this.#current.result;
	}

	get prev(){
		return this.#current.prev;
	}

	get next(){
		return this.#current.next;
	}

	get plyID(){
		return this.#current.plyID;
	}

	get drawOffer(){
		return this.#current.drawOffer;
	}

	// State

	get fen(){
		return this.state.fen;
	}

	get color(){
		return this.state.color;
	}

	get position(){
		return this.state.position;
	}

	get castling(){
		return this.state.castling;
	}

	get enPassant(){
		return this.state.enPassant;
	}

	get fullmoveNumber(){
		return this.state.fullmoveNumber;
	}

	get halfmoveClock(){
		return this.state.halfmoveClock;
	}

	get lastMove(){
		return this.state.lastMove;
	}

	get moves(){
		return this.state.moves;
	}

	get checkSquares(){
		return this.state.checkSquares;
	}

	get isCheck(){
		return this.state.isCheck;
	}

	get repetitionCount(){
		return this.state.repetitionCount;
	}

	get isDeadPisition(){
		return this.state.isDeadPisition;
	}

	get hash(){
		return this.state.hash;
	}

	// Write State

	set fen(value){
		this.state.setFEN(value);
	}

	set color(value){
		this.state.setColor(value);
	}

	set position(value){
		this.state.setPosition(value);
	}

	set castling(value){
		this.state.setCastling(value);
	}

	set enPassant(value){
		this.state.setEnPassant(value);
	}

	set fullmoveNumber(value){
		this.state.setFullmoveNumber(value);
	}

	set halfmoveClock(value){
		this.state.setHalfmoveClock(value);
	}

	// Castling

	get wk(){
		return this.castling.wk;
	}

	get wq(){
		return this.castling.wq;
	}

	get bk(){
		return this.castling.bk;
	}

	get bq(){
		return this.castling.bq;
	}

	// Write Castling

	set wk(value){
		this.castling.setWK(value);
	}

	set wq(value){
		this.castling.setWQ(value);
	}

	set bk(value){
		this.castling.setBK(value);
	}

	set bq(value){
		this.castling.setBQ(value);
	}

	// Result

	get reason(){
		return this.result.reason;
	}

	// Stats

	get isSetup(){
		return this.current.isSetup;
	}

	get isPromotion(){
		return this.current.isPromotion;
	}

	get isState(){
		return this.current.isState;
	}

	get isMeta(){
		return this.current.isMeta;
	}

	get isPly(){
		return this.current.isPly;
	}

	get canMove(){
		return this.current.canMove;
	}

	get canMeta(){
		return this.current.canMove;
	}

	get isIrreversible(){
		return this.state.isIrreversible;
	}

	get isGameOver(){
		return this.current.isGameOver;
	}

	get isWin(){
		return this.current.isWin;
	}

	get isDraw(){
		return this.current.isDraw;
	}

	get isCheckmate(){
		return this.current.isCheckmate;
	}

	get isStalemate(){
		return this.current.isStalemate;
	}

	get winner(){
		return this.current.winner;
	}

	get loser(){
		return this.current.loser;
	}

	stats(){
		return {
			board: this.board.stats(),
			bestiary: this.bestiary.size,
			tags: this.tags.size,
			time: this.time,
			eventID: this.eventID,
			plyID: this.plyID,
			fen: this.fen,
			color: this.color.toString(),
			enPassant: this.enPassant?.toString() ?? null,
			fullmoveNumber: this.fullmoveNumber,
			halfmoveClock: this.halfmoveClock,
			lastMove: this.lastMove?.toString() ?? null,
			moves: this.moves.size,
			checkSquares: this.checkSquares.length,
			isCheck: this.isCheck,
			repetitionCount: this.repetitionCount,
			isDeadPisition: this.isDeadPisition,
			hash: this.hash,
			reason: this.reason,
			isSetup: this.isSetup,
			isPromotion: this.isPromotion,
			isState: this.isState,
			isPly: this.isPly,
			canMove: this.canMove,
			isGameOver: this.isGameOver,
			isIrreversible: this.isIrreversible,
			isWin: this.isWin,
			isDraw: this.isDraw,
			isCheckmate: this.isCheckmate,
			isStalemate: this.isStalemate,
			winner: this.winner?.toString() ?? null,
			loser: this.loser?.toString() ?? null,
		};
	}

	traceMoves(square, piece){
		return this.state.traceMoves(square, piece);
	}

	// Events

	#push(event){
		NextEvent.set(this.current, event);
		this.#current = event;
		this.#last = event;
		this.emit('transition', this.current);
		this.emit('event', this.current);
		this.current.trigger();
	}

	#gameOver(result){
		this.#push(new GameOverEvent(this.current, result));
	}

	play(){
		if(this.isSetup){
			const state = new StartState(this.state);
			this.#current = state;
			this.#first = state;
			this.#last = state;
			this.current.trigger();
			return true;
		}	return false;
	}

	move(query){
		if(!this.canMove) throw MOVE_LOCKED();
		if(this.isGameOver) throw GAME_OVER();
		const move = this.moves.resolve(query);
		const state = move.apply(this.current);
		if(state.isPly) Next.set(this.ply, state);
		this.#push(state);
		return move;
	}

	promote(pieceArg){
		if(this.isPromotion){
			const piece = this.bestiary.from(pieceArg, this.color);
			const move = this.lastMove.promote(piece);
			const state = move.apply(this.current);
			Next.set(this.ply, state);
			this.#push(state);
			return move;
		}	else throw PROMOTE_LOCKED();
	}

	forfeit(color){
		if(this.isSetup) throw PLAY_LOCKED();
		if(this.isGameOver) throw GAME_OVER();
		this.#gameOver(new Forfeit(Color.invert(color)));
	}

	resign(color){
		if(this.isSetup) throw PLAY_LOCKED();
		if(this.isGameOver) throw GAME_OVER();
		const winner = Color.invert(color);
		if(this.rules.canDeliverMate(this.position, winner))
			this.#gameOver(new Resignation(winner));
		else
			this.#gameOver(new DrawByResignation());
	}

	flagFall(){
		if(this.isSetup) throw PLAY_LOCKED();
		if(this.isGameOver) throw GAME_OVER();
		const winner = this.color.invert();
		if(this.rules.canDeliverMate(this.position, winner))
			this.#gameOver(new WinOnTime(winner));
		else
			this.#gameOver(new DrawOnTime());
	}

	draw(color){
		if(this.isSetup) throw PLAY_LOCKED();
		if(this.isGameOver) throw GAME_OVER();
		const proposer = Color.from(color);
		if(proposer.opposite(this.drawOffer))
			this.#gameOver(new DrawByAgreement());
		else if(this.repetitionCount >= 3)
			this.#gameOver(new ThreefoldRepetition());
		else if(this.halfmoveClock >= 100)
			this.#gameOver(new FiftyMoves());
		else if(!this.drawOffer)
			this.#push(new DrawOfferEvent(this.current, proposer));
	}

	nag(value){
		if(!this.canMeta) throw META_LOCKED();
		this.#push(new NagEvent(this.current, value));
	}

	comment(comment){
		if(!this.canMeta) throw META_LOCKED();
		this.#push(new CommentEvent(this.current, comment));
	}

	// Log

	#seek(event){
		if(event && event !== this.current){
			const {ply, state} = this;
			this.#current = event;
			this.emit('transition', event);
			this.emit('seek', event);
			if(event.state !== state)
				this.emit('seek-state', event);
			if(event.ply !== ply)
				this.emit('seek-ply', event);
			return true;
		}	return false;
	}

	#searchEvent(eventID){
		if(this.isSetup)
			return null;
		if(eventID <= this.first.eventID)
			return this.first;
		if(eventID >= this.last.eventID)
			return this.last;
		if(eventID === this.current)
			return this.current;
		let current = this.current;
		while(current.eventID > eventID)
			current = current.prevEvent;
		while(current.eventID < eventID)
			current = current.nextEvent;
		return current;
	}

	#search(plyID){
		if(this.isSetup)
			return null;
		if(plyID <= this.first.plyID)
			return this.first.ply;
		if(plyID >= this.last.plyID)
			return this.last.ply;
		if(plyID === this.plyID)
			return this.ply;
		let current = this.ply;
		while(current.plyID > plyID)
			current = current.prev;
		while(current.plyID < plyID)
			current = current.next;
		return current;
	}

	undo(){
		return this.#seek(this.prev);
	}

	redo(){
		return this.#seek(this.next);
	}

	go(offset){
		return this.goto(this.plyID + offset);
	}

	goto(plyID){
		return this.#seek(this.#search(plyID));
	}

	rewind(){
		return this.#seek(this.first);
	}

	end(){
		return this.#seek(this.last);
	}

	undoEvent(){
		return this.#seek(this.prevEvent);
	}

	redoEvent(){
		return this.#seek(this.nextEvent);
	}

	goEvent(offset){
		return this.gotoEvent(this.eventID + offset);
	}

	gotoEvent(eventID){
		return this.#seek(this.#searchEvent(eventID));
	}

	* log(){
		let ply = this.first;
		while(ply){
			yield ply;
			ply = ply.next;
		}
	}

	* moveLog(){
		let ply = this.first;
		if(ply) while(ply = ply.next) yield ply;
	}

	* events(){
		let event = this.first;
		while(event){
			yield event;
			event = event.nextEvent;
		}
	}

	[Symbol.iterator](){
		return this.log();
	}

	toPGN(){
		return GameToPGN(this);
	}
}
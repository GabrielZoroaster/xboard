
export {stringify, PGNWriter as Writer}

import {RESULTS} from './const.js'
import {Color} from '../color.js'

function TestComment1(text){
	if(/\n/.test(text))
		throw new Error("Invalid character '\\n' in pgn comment");
	if(/\r/.test(text))
		throw new Error("Invalid character '\\r' in pgn comment");
}

function TestComment2(text){
	if(/}/.test(text))
		throw new Error("Invalid character '}' in pgn comment");
}

function TestTagName(text){
	const result = /[^_a-zA-Z0-9]/.exec(text);
	if(result)
		throw new Error(`Invalid character '${result[0]}' pgn tag name`);
}

function TestTagValue(text){
	if(/"/.test(text))
		throw new Error(`Invalid character '"' in pgn tag value`);
}

function TestTag(name, value){
	TestTagName(name);
	TestTagValue(value);
}

function TestResult(text){
	if(!RESULTS.includes(text))
		throw new Error('Invalid pgn result value');
}

function HeaderNotAllowed(){
	throw new Error('Cannot set PGN header: Move block is not completed. The game result is missing');
}

function ColorNotAllowed(){
	throw new Error('Cannot set color: Move block is not completed. The game result is missing');
}

function NumberNotAllowed(){
	throw new Error('Cannot set number: Move block is not completed. The game result is missing');
}

function CloseRAVNotAllowed(){
	throw new Error('Attempted to close a RAV block when no RAV block was open');
}

function stringify(games){
	const writer = new PGNWriter();
	writer.games(games);
	return writer.release();
}

function IsString(value){
	return typeof value === 'string';
}

function IsObject(value){
	if(value === null)
		return false;
	if(typeof value === 'object')
		return true;
	return false;
}

function MoveToPGN(move){
	if(IsString(move))
		return {move};
	if(IsObject(move))
		return MoveObjectToPGN(move);
	throw new Error('The argument move must be a string or an object');
}

function NagsToPGN(nags){
	return nags.map(nag => `$${nag}`);
}

function MoveObjectToPGN({
	move: moveArg,
	nags = [],
	ravs = [],
}){
	return {move: [moveArg, ... NagsToPGN(nags)].join(' '), ravs};
}

function NumberFrom(number){
	if(!Number.isFinite(number))
		throw new TypeError('Invalid move number');
	if(number < 1)
		throw new TypeError('Number must be a positive integer');
	return number;
}

class PGNWriter {

	#context = new WriterContext();

	get context(){
		return this.#context;
	}

	// User Events

	setColor(color){
		this.#context.setColor(Color.from(color));
	}

	setNumber(number){
		this.#context.setNumber(NumberFrom(number));
	}

	games(games){
		return this.#context.games(games);
	}

	game(game){
		return this.#context.game(game);
	}

	comment(text){
		return this.#context.comment(text);
	}

	comment1(text){
		return this.#context.comment1(text);
	}

	comment2(text){
		return this.#context.comment2(text);
	}

	tags(tags){
		return this.#context.tags(tags);
	}

	moves(moves){
		return this.#context.moves(moves);
	}

	result(result){
		return this.#context.result(result);
	}

	tag(name, value){
		return this.#context.tag(name, value);
	}

	move(move){
		return this.#context.move(move);
	}

	ravs(ravs){
		return this.#context.ravs(ravs);
	}

	rav(moves){
		return this.#context.rav(moves);
	}

	openRAV(){
		return this.#context.openRAV();
	}

	closeRAV(){
		return this.#context.closeRAV();
	}

	endRAV(){
		return this.#context.endRAV();
	}

	release(){
		return this.#context.release();
	}
}

class WriterContext {

	state = new GlobalState(this);
	#pgn = [];

	get depth(){
		return this.state.depth;
	}

	get number(){
		return this.state.number;
	}

	get turn(){
		return this.state.turn;
	}

	get color(){
		return this.state.color;
	}

	get isGlobal(){
		return this.state.isGlobal;
	}

	get pgn(){
		return this.#pgn;
	}

	stat(){
		return {
			depth: this.depth,
			number: this.number,
			color: this.color,
		};
	}

	// PGF Events

	write(... pgn){
		this.#pgn.push(... pgn);
	}

	// Stack Events

	push(state){
		this.state = state;
	}

	Header(){
		this.state.Header();
	}

	Movetext(){
		this.state.Movetext();
	}

	RAV(){
		this.state.RAV();
	}

	pop(){
		const state = this.state.parent;
		if(state){
			this.state.release();
			this.state = state;
			return true;
		}	return false;
	}

	end(){
		let state = null;
		while(state = this.state.parent){
			this.state.release();
			this.state = state;
		}
	}

	endRAV(){
		while(this.state.isRAV){
			this.state.release();
			this.state = this.state.parent;
		}
	}

	// User Events

	setColor(color){
		this.state.setColor(color);
	}

	setNumber(number){
		this.state.setNumber(number);
	}

	games(games){
		for(const game of games)
			this.game(game);
	}

	game({
		tags = {},
		movetext = [],
		result = '*',
	}){
		this.tags(tags);
		this.moves(movetext);
		this.result(result);
	}

	comment(text){
		this.comment2(text);
	}

	comment1(text){
		this.state.comment1(text);
	}

	comment2(text){
		this.state.comment2(text);
	}

	tags(tags){
		for(const [name, value] of Object.entries(tags))
			this.tag(name, value);
	}

	moves(moves){
		for(const move of moves)
			this.move(move);
	}

	result(result){
		this.state.result(result);
	}

	tag(name, value){
		this.state.tag(name, value);
	}

	move(move){
		this.state.move(move);
	}

	ravs(ravs){
		for(const moves of ravs)
			this.rav(moves);
	}

	rav(moves){
		this.openRAV();
		this.moves(moves);
		this.closeRAV();
	}

	openRAV(){
		this.state.openRAV();
	}

	closeRAV(){
		this.state.closeRAV();
	}

	release(){
		this.end();
		const pgn = this.pgn.join('\n\n');
		this.#pgn = [];
		return pgn;
	}
}

class WriterState {

	#context;

	constructor(context){
		this.#context = context;
	}

	get context(){
		return this.#context;
	}

	get state(){
		return this.#context.state;
	}

	get parent(){
		return null;
	}

	get depth(){
		return 0;
	}

	get number(){
		return null;
	}

	get turn(){
		return null;
	}

	get color(){
		return null;
	}

	get isGlobal(){
		return false;
	}

	get isRAV(){
		return false;
	}

	// Stack Events

	push(state){
		this.#context.push(state);
	}

	release(){
		// do nothing
	}

	Header(){
		// do nothing
	}

	Movetext(){
		// do nothing
	}

	RAV(){
		// do nothing
	}

	// User Events

	setColor(color){
		// do nothing
	}

	setNumber(number){
		// do nothing
	}

	comment1(text){
		// do nothing
	}

	comment2(text){
		// do nothing
	}

	result(result){
		// do nothing
	}

	tag(name, value){
		// do nothing
	}

	move(move){
		// do nothing
	}

	openRAV(){
		// do nothing
	}

	closeRAV(){
		CloseRAVNotAllowed();
	}
}

class GlobalState extends WriterState {

	get isGlobal(){
		return true;
	}

	// Stack Events

	Header(color, number){
		this.push(new HeaderState(this, color, number));
	}

	Movetext(){
		this.Header();
		this.state.Movetext();
	}

	RAV(){
		this.Movetext();
		this.state.RAV();
	}

	// User Events

	setColor(color){
		this.Header();
		this.state.setColor(color);
	}

	setNumber(number){
		this.Header();
		this.state.setNumber(number);
	}

	comment1(text){
		this.Header();
		this.state.comment1(text);
	}

	comment2(text){
		this.Header();
		this.state.comment2(text);
	}

	tag(name, value){
		this.Header();
		this.state.tag(name, value);
	}

	result(result){
		TestResult(result);
		this.context.write(result);
		this.context.end();
	}

	move(move){
		this.Movetext();
		this.state.move(move);
	}

	openRAV(){
		this.Movetext();
		this.state.openRAV();
	}
}

class GameState extends WriterState {

	#parent;
	#depth;
	#pgn = [];

	constructor(parent){
		super(parent.context);
		this.#parent = parent;
		this.#depth = parent.depth + 1;
	}

	get parent(){
		return this.#parent;
	}

	get depth(){
		return this.#depth;
	}

	get pgn(){
		return this.#pgn;
	}

	// PGN Events

	write(... pgn){
		this.#pgn.push(... pgn);
	}

	// User Events

	comment1(text){
		TestComment1(text);
		this.write(`;${text}\n`);
	}

	comment2(text){
		TestComment1(text);
		this.write(`{${text}}`);
	}
}

class HeaderState extends GameState {

	#color = Color.white;
	#number = 1;
	#movetext = null;

	get color(){
		return this.#color;
	}

	get number(){
		return this.#number;
	}

	get movetext(){
		return this.#movetext;
	}

	// PGN Events

	onMovetext(movetext){
		this.#movetext = movetext;
	}

	// Stack Events

	release(){
		if(this.pgn.length > 0)
			this.context.write(this.pgn.join('\n'));
		if(this.movetext)
			this.context.write(this.movetext);
	}

	Movetext(){
		const state = MoveState.from(this.color, this.number);
		this.push(new MovetextState(this, state));
	}

	RAV(){
		this.Movetext();
		this.state.RAV();
	}

	// User Events

	setColor(color){
		this.#color = color;
	}

	setNumber(number){
		this.#number = number;
	}

	result(result){
		TestResult(result);
		this.write('', result);
		this.context.end();
	}

	tag(name, value){
		TestTag(name, value);
		this.write(`[${name} "${value}"]`);
	}

	move(move){
		this.Movetext();
		this.state.move(move);
	}

	openRAV(){
		CloseRAVNotAllowed();
	}
}

class MovesState extends GameState {

	#moveState;

	constructor(parent, moveState){
		super(parent);
		this.#moveState = moveState;
	}

	get moveState(){
		return this.#moveState;
	}

	get color(){
		return this.moveState.color;
	}

	get number(){
		return this.moveState.number;
	}

	// PGN Events

	writeRAV(pgn){
		if(pgn.length > 0)
			this.parent.write(`(${pgn})`);
	}

	// Stack Events

	RAV(){
		const state = this.moveState.toRAV();
		this.push(new RAVState(this, state));
	}

	nextMove(){
		this.#moveState = this.moveState.next();
	}

	// User Events

	setColor(color){
		throw ColorNotAllowed();
	}

	setNumber(number){
		throw NumberNotAllowed();
	}

	tag(name, value){
		HeaderNotAllowed();
	}

	move(rawMove){
		const {move, ravs = []} = MoveToPGN(rawMove);
		this.write(this.moveState.moveToPGN(move));
		this.nextMove();
		this.context.ravs(ravs);
	}

	openRAV(){
		this.RAV();
	}
}

class MovetextState extends MovesState {

	// Stack Events

	release(){
		this.parent.onMovetext(this.pgn.join(' '));
	}

	// User Events

	result(result){
		TestResult(result);
		this.write(result);
		this.context.end();
	}
}

class RAVState extends MovesState {

	get isRAV(){
		return true;
	}

	// Stack Events

	release(){
		this.writeRAV(this.pgn.join(' '));
	}

	// User Events

	result(result){
		TestResult(result);
		this.context.endRAV();
		this.state.write(result);
		this.context.end();
	}

	closeRAV(){
		this.context.pop();
	}
}

class MoveState {

	static from(color, number){
		if(Color.isWhite(color))
			return new WhiteMoveState(number);
		if(Color.isBlack(color))
			return new FirstBlackMoveState(number);
		throw new Error('invalid color');
	}

	#number;

	constructor(number){
		this.#number = number;
	}

	get number(){
		return this.#number;
	}

	get color(){
		return null;
	}

	toRAV(){
		return null;
	}

	next(){
		return null;
	}

	moveToPGN(move){
		return move;
	}
}

class WhiteMoveState extends MoveState {

	get color(){
		return Color.white;
	}

	toRAV(){
		return new FirstBlackMoveState(this.number - 1);
	}

	next(){
		return new BlackMoveState(this.number);
	}

	moveToPGN(move){
		return `${this.number}. ${move}`;
	}
}

class BlackMoveState extends MoveState {

	get color(){
		return Color.black;
	}

	toRAV(){
		return new WhiteMoveState(this.number);
	}

	next(){
		return new WhiteMoveState(this.number + 1);
	}
}

class FirstBlackMoveState extends MoveState {

	get color(){
		return Color.black;
	}

	toRAV(){
		return new WhiteMoveState(this.number);
	}

	next(){
		return new WhiteMoveState(this.number + 1);
	}

	moveToPGN(move){
		return `${this.number}... ${move}`;
	}
}
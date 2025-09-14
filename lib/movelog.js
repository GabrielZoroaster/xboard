
import {Node} from './node.js'
import {Game} from '../xchess2/index.js'

export class MoveLog extends Node {

	#context;

	constructor(game, config){
		super();
		this.#context = new MoveLogContext(this, game, config);
		this.class.add('xboard-movelog');
	}

	get game(){
		return this.#context.game;
	}

	get pieceLetter(){
		return this.#context.pieceLetter;
	}

	get autoscroll(){
		return this.#context.autoscroll;
	}

	// Write

	set game(game){
		this.#context.game = game;
	}

	set pieceLetter(value){
		this.#context.pieceLetter = value;
	}

	set autoscroll(value){
		this.#context.autoscroll = value;
	}
}

class MoveLogContext {

	#log;
	#game;
	#pieceLetter;
	#autoscroll;
	#states = new Map();
	#current = null;

	constructor(log, game, {
		pieceLetter = true,
		autoscroll = true,
	} = {}){
		this.#log = log;
		this.#pieceLetter = Boolean(pieceLetter);
		this.#autoscroll = Boolean(autoscroll);
		this.#SetGame(Game.from(game));
	}

	get log(){
		return this.#log;
	}

	get game(){
		return this.#game;
	}

	get pieceLetter(){
		return this.#pieceLetter;
	}

	get autoscroll(){
		return this.#autoscroll;
	}

	get current(){
		return this.#current;
	}

	// Write

	set game(game){
		this.#ChangeGame(game);
	}

	set pieceLetter(value){
		const pieceLetter = Boolean(value);
		if(this.pieceLetter !== pieceLetter){
			this.#pieceLetter = pieceLetter;
			this.syncText();
		}
	}

	set autoscroll(value){
		const autoscroll = Boolean(value);
		if(this.autoscroll !== autoscroll){
			this.#autoscroll = autoscroll;
			this.syncScroll();
		}
	}

	// States

	has(state){
		return this.#states.has(state);
	}

	get(state){
		return this.#states.get(state);
	}

	set(state, record){
		this.#states.set(state, record);
	}

	delete(state){
		this.#states.delete(state);
	}

	// Log Events

	#ChangeGame(value){
		const game = Game.from(value);
		if(this.game !== game){
			this.#ClearGame();
			this.#SetGame(game);
		}
	}

	#ClearGame(){
		this.game.unsubscribe(this);
		this.clear();
	}

	#SetGame(game){
		this.#game = game;
		this.game.subscribe(this);
		this.game.isSetup || this.fill(game);
	}

	// Game Events

	emit(type, state){
		switch(type){
			case 'play': return this.play(state);
			case 'seek-ply': return this.seek(state);
			case 'move': return this.move(this.game.state);
		}
	}

	play(state){
		this.fill(this.game);
	}

	clear(){
		this.log.ls.clear();
		this.#states.clear();
		this.#current = null;
	}

	fill(game){
		let last = this.start(game.first);
		for(const state of game.moveLog())
			last = last.push(state);
		this.sync();
	}

	start(state){
		if(!this.has(state)){
			const record = new StartRecord(this, state);
			this.#states.set(state, record);
			this.log.append(record);
			return record;
		}
	}

	seek(state){
		const current = this.get(state);
		if(this.current !== current){
			if(this.current)
				this.current.blur();
			if(current){
				this.#current = current;
				this.current.focus();
				this.syncScroll();
			} else {
				this.#current = null;
			}
		}
	}

	move(state){
		this.current.truncate();
		this.current.push(state);
		this.sync();
	}

	// MoveLog Events

	sync(){
		this.seek(this.game.current);
	}

	syncScroll(){
		if(this.autoscroll) this.scroll();
	}

	syncText(){
		for(const record of this.#states.values())
			record.syncText();
	}

	scroll(){
		if(this.current) this.current.scroll();
	}

	// Record Events

	push(state){
		const fullmove = new FullMove(this, state.prev.fullmoveNumber);
		this.log.append(fullmove);
		return fullmove.push(state);
	}
}

class LogRecord extends Node {

	#context;
	#state;

	constructor(context, state){
		super();
		this.#context = context;
		this.#state = state;
		this.context.set(this.state, this);
		this.class.add('state');
		this.on('click', () => this.goto());
	}

	get context(){
		return this.#context;
	}

	get log(){
		return this.#context.log;
	}

	get game(){
		return this.#context.game;
	}

	get state(){
		return this.#state;
	}

	focus(){
		this.class.add('current');
	}

	blur(){
		this.class.remove('current');
	}

	scroll(){
		this.scrollIntoView({block: 'nearest', behavior: 'smooth'});
	}

	push(state){
		// abstract
	}

	truncate(){
		// abstract
	}

	syncText(){
		// abstract
	}

	goto(){
		this.game.goto(this.state.plyID);
	}
}

class StartRecord extends LogRecord {

	constructor(context, state){
		super(context, state);
		this.class.add('start');
		this.text = 'Start';
	}

	push(state){
		return this.context.push(state);
	}

	truncate(){
		if(this.nextNode) this.nextNode.prune();
	}
}

class MoveRecord extends LogRecord {

	#fullmove;

	constructor(fullmove, state){
		super(fullmove.context, state);
		this.#fullmove = fullmove;
		this.class.add('move');
		this.class.add(this.move.color);
		if(this.move.piece)
			this.class.add(this.move.piece.id);
		if(this.state.isCheck)
			this.class.add('check');
		if(this.state.isCheckmate)
			this.class.add('checkmate');
		this.syncText();
	}

	get fullmove(){
		return this.#fullmove;
	}

	get move(){
		return this.state.lastMove;
	}

	push(state){
		return this.fullmove.push(state);
	}

	syncText(){
		this.text = this.state.toSAN({pieceLetter: this.context.pieceLetter});
	}
}

class WhiteMove extends MoveRecord {

	truncate(){
		this.fullmove.truncateWhite();
	}
}

class BlackMove extends MoveRecord {

	truncate(){
		this.fullmove.truncateBlack();
	}
}

class FullMove extends Node {

	#context;
	#number = new Node();
	#white = null
	#black = null;

	constructor(context, number){
		super();
		this.#context = context;
		this.class.add('fullmove');
		this.number.class.add('number');
		this.number.text = `${number}.`;
		this.append(this.number);
	}

	get context(){
		return this.#context;
	}

	get number(){
		return this.#number;
	}

	get white(){
		return this.#white;
	}

	get black(){
		return this.#black;
	}

	push(state){
		if(state.color.isBlack){
			if(this.white || this.black)
				return this.context.push(state);
			this.#white = new WhiteMove(this, state);
			this.append(this.white);
			return this.white;
		}
		if(state.color.isWhite){
			if(this.black)
				return this.context.push(state);
			if(!this.white)
				this.append(new Ellipsis());
			this.#black = new BlackMove(this, state);
			this.append(this.black);
			return this.black;
		}
	}

	#deleteBlack(){
		if(this.black){
			this.black.remove();
			this.context.delete(this.black.state);
			this.#black = null;
		}
	}

	#delete(){
		if(this.white)
			this.context.delete(this.white.state);
		if(this.black)
			this.context.delete(this.black.state);
		this.remove();
	}

	prune(){
		this.truncate();
		this.#delete();
	}

	truncate(){
		let fullmove;
		while(fullmove = this.nextNode)
			fullmove.#delete();
	}

	truncateWhite(){
		this.#deleteBlack();
		this.truncateBlack();
	}

	truncateBlack(){
		this.truncate();
	}
}

class Ellipsis extends Node {

	constructor(){
		super();
		this.class.add('ellipsis');
		this.text = '…';
	}
}
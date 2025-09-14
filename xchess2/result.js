
export class GameResult {

	get isGameOver(){
		return false;
	}

	get isWin(){
		return false;
	}

	get isDraw(){
		return false;
	}

	get isCheckmate(){
		return false;
	}

	get isStalemate(){
		return false;
	}

	get winner(){
		return null;
	}

	get loser(){
		return null;
	}

	get reason(){
		return '';
	}

	get pgn(){
		return '?';
	}

	// Events

	trigger(game){
		// abstract
	}
}

export class NoResult extends GameResult {

	get pgn(){
		return '*';
	}

	get reason(){
		return 'no result';
	}
}

export class Draw extends GameResult {

	get isGameOver(){
		return true;
	}

	get isDraw(){
		return true;
	}

	get pgn(){
		return '1/2-1/2';
	}

	// Events

	trigger(game){
		game.emit('gameover', this);
		game.emit('draw', this);
	}
}

export class Win extends GameResult {

	#winner;

	constructor(winner){
		super();
		this.#winner = winner;
	}

	get winner(){
		return this.#winner;
	}

	get loser(){
		return this.#winner.invert();
	}

	get isGameOver(){
		return true;
	}

	get isWin(){
		return true;
	}

	get pgn(){
		if(this.winner.isWhite)
			return '1-0';
		if(this.winner.isBlack)
			return '0-1';
	}

	// Events

	trigger(game){
		game.emit('gameover', this);
		game.emit('win', this);
	}
}

export class Checkmate extends Win {

	get isCheckmate(){
		return true;
	}

	get reason(){
		return 'checkmate';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('checkmate', this);
	}
}

export class Forfeit extends Win {

	get reason(){
		return 'forfeit';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('forfeit', this);
	}
}

export class Resignation extends Win {

	get reason(){
		return 'resignation';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('resignation', this);
	}
}

export class WinOnTime extends Win {

	get reason(){
		return 'win on time';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('win-on-time', this);
	}
}

export class Stalemate extends Draw {

	get isStalemate(){
		return true;
	}

	get reason(){
		return 'stalemate';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('stalemate', this);
	}
}

export class DeadPosition extends Draw {

	get reason(){
		return 'dead position';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('dead-position', this);
	}
}

export class ThreefoldRepetition extends Draw {

	get reason(){
		return '3-repetition';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-3-repetition', this);
	}
}

export class FivefoldRepetition extends Draw {

	get reason(){
		return '5-repetition';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-5-repetition', this);
	}
}

export class FiftyMoves extends Draw {

	get reason(){
		return '50 moves';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-50-moves', this);
	}
}

export class SeventyFiveMoves extends Draw {

	get reason(){
		return '75 moves';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-75-moves', this);
	}
}

export class DrawByAgreement extends Draw {

	get reason(){
		return 'draw by agreement';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-agreement', this);
	}
}

export class DrawByResignation extends Draw {

	get reason(){
		return 'draw by resignation';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-by-resignation', this);
	}
}

export class DrawOnTime extends Draw {

	get reason(){
		return 'draw on time';
	}

	// Events

	trigger(game){
		super.trigger(game);
		game.emit('draw-on-time', this);
	}
}
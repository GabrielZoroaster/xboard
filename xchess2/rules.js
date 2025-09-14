
import {INVALID_RULES} from './errors.js'
import {Checkmate, Stalemate, DeadPosition, SeventyFiveMoves, FivefoldRepetition} from './result.js'
import {Color} from './color.js'
import {Bishop, Knight} from './piece.chess.js'

function * StateToMoves(state){
	yield * state.position.moves(state);
	yield * state.castling.moves(state);
}

function * StateToLegalMoves(state){
	for(const move of StateToMoves(state)){
		if(!move.isCheck(state.position))
			yield move;
	}
}

class MaterialAnalyzer {

	#knights;
	#bishopColor;

	get knights(){
		return this.#knights;
	}

	get bishopColor(){
		return this.#bishopColor;
	}

	reset(){
		this.#knights = 0;
		this.#bishopColor = null;
	}

	onKnight(){
		if(this.knights > 0)
			return true;
		if(this.bishopColor)
			return true;
		this.#knights ++;
	}

	onBishop(color){
		if(this.kinghts > 0)
			return true;
		if(this.bishopColor && (this.bishopColor !== color))
			return true;
		this.#bishopColor = color;
	}

	checkMate(square, piece){
		if(Knight.is(piece) && this.onKnight())
			return true;
		if(Bishop.is(piece) && this.onBishop(square.color))
			return true;
		return false;
	}
}

const Analyzer = new MaterialAnalyzer();
const WhiteAnalyzer = new MaterialAnalyzer();
const BlackAnalyzer = new MaterialAnalyzer();

function CanDeliverMate(position, colorArg){
	const color = Color.from(colorArg);
	Analyzer.reset();
	for(const [square, piece] of position){
		if(piece.color !== color)
			continue;
		if(piece.isMating)
			return true;
		if(Analyzer.checkMate(square, piece))
			return true;
	}	return false;
}

function IsDeadPosition(position){
	WhiteAnalyzer.reset();
	BlackAnalyzer.reset();
	for(const [square, piece] of position){
		if(piece.isMating)
			return false;
		if(piece.color.isWhite && WhiteAnalyzer.checkMate(square, piece))
			return false;
		if(piece.color.isBlack && BlackAnalyzer.checkMate(square, piece))
			return false;
	}	return true;
}

export class RuleEngine {

	static from(rules){
		if(rules instanceof RuleEngine)
			return rules;
		throw INVALID_RULES();
	}

	moves(state){
		return StateToLegalMoves(state);
	}

	checkSquares(state){
		return state.position.checks(state.color);
	}

	repetitionCount(state){
		const hash = state.hash;
		while(state){
			if(state.isIrreversible)
				return 1;
			state = state.prev;
			if(state.hash === hash)
				return state.repetitionCount + 1;
		}	return 1;
	}

	isDeadPosition(position){
		return IsDeadPosition(position);
	}

	canDeliverMate(position, color){
		return CanDeliverMate(position, color);
	}

	result(state){
		if(state.moves.size < 1){
			if(state.isCheck) return new Checkmate(state.color.invert());
			return new Stalemate();
		}
		if(state.isDeadPosition)
			return new DeadPosition();
		if(state.halfmoveClock >= 150)
			return new SeventyFiveMoves();
		if(state.repetitionCount >= 5)
			return new FivefoldRepetition();
		return state.result;
	}
}

export const chessRules = new RuleEngine();
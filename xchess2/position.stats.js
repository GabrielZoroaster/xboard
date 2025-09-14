
import {Color} from './color.js'

export function Weight(position){
	let weight = 0;
	for(const piece of position.values())
		weight += piece.weight;
	return weight;
}

export function Advantage(position, color = Color.white){
	let advantage = 0;
	for(const piece of position.values())
		advantage += piece.advantage(color);
	return advantage;
}

function CreateStat(){
	return {count: 0, weight: 0, pieces: {}};
}

function AddToStat(stat, piece){
	stat.count ++;
	stat.weight += piece.weight;
	const count = stat.pieces[piece.id] ?? 0;
	stat.pieces[piece.id] = count + 1;
}

export function Stats(position, color = Color.white){
	const density = position.density();
	const advantage = 0;
	const white = CreateStat();
	const black = CreateStat();
	const stats = {advantage, density, ... CreateStat(), white, black};
	for(const piece of position.values()){
		AddToStat(stats, piece);
		stats.advantage += piece.advantage(color);
		if(Color.isWhite(piece.color))
			AddToStat(white, piece);
		if(Color.isBlack(piece.color))
			AddToStat(black, piece);
	}	return stats;
}

function TraceMapSquareText(traceMap, limit = Infinity){
	const position = traceMap.position
	return function(square){
		const count = traceMap.get(square);
		if(count <= limit) return String(count);
		const piece = position.get(square);
		if(piece) return piece.sign ?? piece.fen;
	}
}

class TraceMap extends Map {

	#position;

	constructor(position, squares){
		super(squares);
		this.#position = position;
	}

	get position(){
		return this.#position;
	}

	get(square){
		return super.get(this.position.board.get(square));
	}

	has(square){
		return super.has(this.position.board.get(square));
	}

	set(square, value){
		return super.set(this.position.board.get(square), parseInt(value));
	}

	text(limit){
		return this.position.board.text(TraceMapSquareText(this, limit));
	}
}

export function TraceMoves(state, squareArg, pieceArg){
	const {board, bestiary} = state.game;
	const square = board.get(squareArg);
	const piece = pieceArg ? bestiary.from(pieceArg) : state.position.get(square);
	const squares = new TraceMap(state.position);
	if(piece){
		squares.set(square, 0);
		let count = 1;
		let from = [square];
		let to = [];
		while(from.length > 0){
			for(const square of from){
				for(const move of piece.moves(state, square)){
					if(!move.to) continue;
					if(squares.has(move.to)) continue;
					to.push(move.to);
					squares.set(move.to, count);
				}
			}
			from = to;
			to = [];
			count ++;
		}
	}	return squares;
}
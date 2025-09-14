
import {
	PieceMove,
	CaptureMove,
	PawnDoubleMove,
	EnPassantMove,
	PromotionMove,
	PromotionPendingMove,
} from './move.js'

export function * walk(from, piece, position, squares){
	for(const to of squares){
		const source = position.get(to);
		if(source){
			if(source.isCapturable(piece))
				yield new CaptureMove(piece, from, to, source, to);
		} else yield new PieceMove(piece, from, to);
	}
}

export function * trace(from, piece, position, squares){
	for(const to of squares){
		const source = position.get(to);
		if(source){
			if(source.isCapturable(piece))
				yield new CaptureMove(piece, from, to, source, to);
			if(source.isPassable(piece))
				continue;
			break;
		} yield new PieceMove(piece, from, to);
	}
}

export function ray(from, piece, position, dx, dy){
	return trace(from, piece, position, from.ray(dx, dy));
}

export function * hop(from, piece, position, dx, dy){
	for(const square of from.ray(dx, dy)){
		if(position.has(square)){
			const to = square.to(dx, dy);
			if(to){
				const source = position.get(to);
				if(source){
					if(source.isCapturable(piece))
						yield new CaptureMove(piece, from, to, source, to);
				} else yield new PieceMove(piece, from, to);
				break;
			}
		}
	}
}

// Leapers

export function T(from, piece, position, R){
	return walk(from, piece, position, from.walk([0, R], [0, -R], [R, 0], [-R, 0])); 
}

export function X(from, piece, position, R){
	return walk(from, piece, position, from.walk([R, R], [R, -R], [-R, R], [-R, -R])); 
}

export function L(from, piece, position, A, B){
	return walk(from, piece, position, from.walk([A, B], [A, -B], [-A, B], [-A, -B], [B, A], [B, -A], [-B, A], [-B, -A]));
}

export function W(from, piece, position){
	return T(from, piece, position, 1);
}

export function D(from, piece, position){
	return T(from, piece, position, 2);
}

export function H(from, piece, position){
	return T(from, piece, position, 3);
}

export function F(from, piece, position){
	return X(from, piece, position, 1);
}

export function A(from, piece, position){
	return X(from, piece, position, 2);
}

export function G(from, piece, position){
	return X(from, piece, position, 3);
}

export function N(from, piece, position){
	return L(from, piece, position, 1, 2);
}

export function C(from, piece, position){
	return L(from, piece, position, 1, 3);
}

export function Z(from, piece, position){
	return L(from, piece, position, 2, 3);
}

export function * Q(from, piece, position){
	yield * W(from, piece, position);
	yield * F(from, piece, position);
}

// Riders

export function * TT(from, piece, position, R){
	yield * ray(from, piece, position, 0, R);
	yield * ray(from, piece, position, 0, -R);
	yield * ray(from, piece, position, R, 0);
	yield * ray(from, piece, position, -R, 0);
}

export function * XX(from, piece, position, R){
	yield * ray(from, piece, position, R, R);
	yield * ray(from, piece, position, R, -R);
	yield * ray(from, piece, position, -R, R);
	yield * ray(from, piece, position, -R, -R);
}

export function * LL(from, piece, position, A, B){
	yield * ray(from, piece, position, A, B);
	yield * ray(from, piece, position, A, -B);
	yield * ray(from, piece, position, -A, B);
	yield * ray(from, piece, position, -A, -B);
	yield * ray(from, piece, position, B, A);
	yield * ray(from, piece, position, B, -A);
	yield * ray(from, piece, position, -B, A);
	yield * ray(from, piece, position, -B, -A);
}

export function WW(from, piece, position){
	return TT(from, piece, position, 1);
}

export function DD(from, piece, position){
	return TT(from, piece, position, 2);
}

export function HH(from, piece, position){
	return TT(from, piece, position, 3);
}

export function FF(from, piece, position){
	return XX(from, piece, position, 1);
}

export function AA(from, piece, position){
	return XX(from, piece, position, 2);
}

export function GG(from, piece, position){
	return XX(from, piece, position, 3);
}

export function NN(from, piece, position){
	return LL(from, piece, position, 1, 2);
}

export function CC(from, piece, position){
	return LL(from, piece, position, 1, 3);
}

export function ZZ(from, piece, position){
	return LL(from, piece, position, 2, 3);
}

export function * QQ(from, piece, position){
	yield * WW(from, piece, position);
	yield * FF(from, piece, position);
}

// Hoppers

export function * hopT(from, piece, position, R){
	yield * hop(from, piece, position, 0, R);
	yield * hop(from, piece, position, 0, -R);
	yield * hop(from, piece, position, R, 0);
	yield * hop(from, piece, position, -R, 0);
}

export function * hopX(from, piece, position, R){
	yield * hop(from, piece, position, R, R);
	yield * hop(from, piece, position, R, -R);
	yield * hop(from, piece, position, -R, R);
	yield * hop(from, piece, position, -R, -R);
}

export function * hopL(from, piece, position, A, B){
	yield * hop(from, piece, position, A, B);
	yield * hop(from, piece, position, A, -B);
	yield * hop(from, piece, position, -A, B);
	yield * hop(from, piece, position, -A, -B);
	yield * hop(from, piece, position, B, A);
	yield * hop(from, piece, position, B, -A);
	yield * hop(from, piece, position, -B, A);
	yield * hop(from, piece, position, -B, -A);
}

export function hopW(from, piece, position){
	return hopT(from, piece, position, 1);
}

export function hopD(from, piece, position){
	return hopT(from, piece, position, 2);
}

export function hopH(from, piece, position){
	return hopT(from, piece, position, 3);
}

export function hopF(from, piece, position){
	return hopX(from, piece, position, 1);
}

export function hopA(from, piece, position){
	return hopX(from, piece, position, 2);
}

export function hopG(from, piece, position){
	return hopX(from, piece, position, 3);
}

export function hopN(from, piece, position){
	return hopL(from, piece, position, 1, 2);
}

export function hopC(from, piece, position){
	return hopL(from, piece, position, 1, 3);
}

export function hopZ(from, piece, position){
	return hopL(from, piece, position, 2, 3);
}

export function * hopQ(from, piece, position){
	yield * hopW(from, piece, position);
	yield * hopF(from, piece, position);
}

// Pawn

function PawnCapture(from, piece, state, dx){
	const to = from.to(dx, piece.color.moveDir);
	if(to){
		const captured = state.position.get(to);
		if(captured && captured.isCapturable(piece))
			return new CaptureMove(piece, from, to, captured, to);
		if(to === state.enPassant){
			const capturedAt = from.dx(dx);
			const captured = state.position.get(capturedAt);
			if(captured && captured.isCapturable(piece))
				return new EnPassantMove(piece, from, to, captured, capturedAt);
		}
	}
}

function * PawnMoves(from, piece, state){
	const color = piece.color;
	const rank = color.relRank(from);
	const pos = state.position;
	// Forward Move
	const to = from.dy(color.moveDir);
	if(to && !pos.has(to)){
		yield new PieceMove(piece, from, to);
		// Double Forward Move
		if(rank === 2){
			const to = from.dy(color.moveDir * 2);
			if(to && !pos.has(to))
				yield new PawnDoubleMove(piece, from, to);
		}
	}
	// Left Move
	const leftMove = PawnCapture(from, piece, state, -1);
	if(leftMove) yield leftMove;
	// Right Move
	const rightMove = PawnCapture(from, piece, state, 1);
	if(rightMove) yield rightMove;
}

function * BerolinaPawnMoves(from, piece, state){
	const color = piece.color;
	const rank = color.relRank(from);
	const pos = state.position;
	// Capture Move
}

function * WrapPawnPromotions(piece, state, moves){
	for(const move of moves){
		const to = move.to;
		if(piece.color.relRank(to) === state.game.board.height){
			const promotes = state.game.bestiary.promotes();
			yield new PromotionPendingMove(move, promotes);
			for(const type of promotes)
				yield new PromotionMove(move, new type(piece.color));
		} else yield move;
	}
}

export function pawn(from, piece, state){
	return WrapPawnPromotions(piece, state, PawnMoves(from, piece, state));
}
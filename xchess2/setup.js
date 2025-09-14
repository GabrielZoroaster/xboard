
import {INCOMPATIBLE_BOARD_SIZE} from './errors.js'

export function Sample(position, probability = 0.5){
	const {board, bestiary} = position;
	if(bestiary.size > 0){
		for(const square of board){
			const piece = bestiary.rand();
			if(Math.random() < probability)
				position.set(square, piece);
		}
	}
}

function CheckSize(board, width, height){
	if(board.width !== width)
		throw INCOMPATIBLE_BOARD_SIZE(board);
	if(board.height !== height)
		throw INCOMPATIBLE_BOARD_SIZE(board);
}

export function Setup(position){
	CheckSize(position.board, 8, 8);
	position.clear();
	position.r('a8');
	position.n('b8');
	position.b('c8');
	position.q('d8');
	position.k('e8');
	position.b('f8');
	position.n('g8');
	position.r('h8');
	position.fillRank(1, 'p');
	position.fillRank(6, 'P');
	position.R('a1');
	position.N('b1');
	position.B('c1');
	position.Q('d1');
	position.K('e1');
	position.B('f1');
	position.N('g1');
	position.R('h1');
}

function Rand(count){
	return Math.floor(Math.random() * count);
}

function RandOF(squares){
	const value = [... squares][Rand(squares.size)];
	squares.delete(value);
	return value;
}

export function Setup960(position){
	CheckSize(position.board, 8, 8);
	const board = position.board;
	position.clear();
	const squares = new Set([0, 1, 2, 3, 4, 5, 6, 7]);

	// Bishop
	const b1 = Rand(4) * 2;
	const b2 = Rand(4) * 2 + 1;
	squares.delete(b1);
	squares.delete(b2);
	position.b(board.at(b1, 0));
	position.b(board.at(b2, 0));
	position.B(board.at(b1, 7));
	position.B(board.at(b2, 7));

	// Queen
	const q = RandOF(squares);
	position.q(board.at(q, 0));
	position.Q(board.at(q, 7));

	// Knight
	const n1 = RandOF(squares);
	const n2 = RandOF(squares);
	position.n(board.at(n1, 0));
	position.n(board.at(n2, 0));
	position.N(board.at(n1, 7));
	position.N(board.at(n2, 7));

	// Rook + King
	const [r1, k, r2] = squares;
	position.r(board.at(r1, 0));
	position.r(board.at(r2, 0));
	position.k(board.at(k, 0));
	position.R(board.at(r1, 7));
	position.R(board.at(r2, 7));
	position.K(board.at(k, 7));

	// Pawns
	position.fillRank(1, 'p');
	position.fillRank(6, 'P');
}
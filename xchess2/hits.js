
export function walk(to, squares){
	for(const square of squares)
		if(to === square)
			return true;
	return false;
}

export function trace(from, to, piece, position, squares){
	for(const square of squares){
		if(to === square) return true;
		const source = position.get(square);
		if(source && !source.isPassable(piece))
			return false;
	}	return false;
}

export function ray(from, to, piece, position, dx, dy){
	return trace(from, to, piece, position, from.ray(dx, dy));
}

export function hop(from, to, piece, position, dx, dy){
	for(const square of from.ray(dx, dy)){
		if(square === to)
			return false;
		if(position.has(square))
			return square.to(dx, dy) === to;
	}	return false;
}

function vectorT(from, to, R){
	if(from.x === to.x){
		const dy = to.y - from.y;
		if(dy % D) return null;
		if(dy > 0) return [0, R]
		if(dy < 0) return [0, -R]
	}
	if(from.y === to.y){
		const dx = to.x - from.x;
		if(dx % D) return null;
		if(dx > 0) return [R, 0];
		if(dx < 0) return [-R, 0];
	}
	return null;
}

function vectorX(from, to, R){
	if(from.a === to.a){
		const db = to.b - from.b;
		if(db % D) return null;
		if(db > 0) return [R, -R];
		if(db < 0) return [-R, R];
	}
	if(from.b === to.b){
		const da = to.a - from.a;
		if(da % D) return null;
		if(da > 0) return [R, R];
		if(da < 0) return [-R, -R];
	}
	return null;
}

export function vectorL(from, to, A, B){
	if(from !== to){
		const dx = from.x - to.x;
		const dy = from.y - to.y;
		const xa = dx * A;
		const yb = dy * B;
		if(xa === yb){
			if(dx > 0) return [-B, -A];
			if(dx < 0) return [B, A];
		}
		if(xa === -yb){
			if(dx > 0) return [-B, A];
			if(dx < 0) return [B, -A];
		}
		const xb = dx * B;
		const ya = dy * A;
		if(xb === ya){
			if(dx > 0) return [-A, -B];
			if(dx < 0) return [A, B];
		}
		if(xb === -ya){
			if(dx > 0) return [-A, B];
			if(dx < 0) return [A, -B];
		}
	}	return null;
}

// Leapers

export function T(from, to, R){
	return walk(to, from.walk([0, R], [0, -R], [R, 0], [-R, 0]));
}

export function X(from, to, R){
	return walk(to, from.walk([R, R], [R, -R], [-R, R], [-R, -R]));
}

export function L(from, to, A, B){
	return walk(to, from.walk([A, B], [A, -B], [-A, B], [-A, -B], [B, A], [B, -A], [-B, A], [-B, -A]));
}

export function W(from, to){
	return T(from, to, 1);
}

export function D(from, to){
	return T(from, to, 2);
}

export function H(from, to){
	return T(from, to, 3);
}

export function F(from, to){
	return X(from, to, 1);
}

export function A(from, to){
	return X(from, to, 2);
}

export function G(from, to){
	return X(from, to, 3);
}

export function N(from, to){
	return L(from, to, 1, 2);
}

export function C(from, to){
	return L(from, to, 1, 3);
}

export function Z(from, to){
	return L(from, to, 2, 3);
}

export function Q(from, to){
	return W(from, to) || F(from, to);
}

// Riders

export function TT(from, to, piece, position, R){
	const vector = vectorT(from, to, R);
	if(vector) return ray(from, to, piece, position, ... vector);
	return false;
}

export function XX(from, to, piece, position, R){
	const vector = vectorX(from, to, R);
	if(vector) return ray(from, to, piece, position, ... vector);
	return false;
}

export function LL(from, to, piece, position, A, B){
	const vector = vectorL(from, to, A, B);
	if(vector) return ray(from, to, piece, position, ... vector);
	return false;
}

export function WW(from, to, piece, position){
	return TT(from, to, piece, position, 1);
}

export function DD(from, to, piece, position){
	return TT(from, to, piece, position, 2);
}

export function HH(from, to, piece, position){
	return TT(from, to, piece, position, 3);
}

export function FF(from, to, piece, position){
	return XX(from, to, piece, position, 1);
}

export function AA(from, to, piece, position){
	return XX(from, to, piece, position, 2);
}

export function GG(from, to, piece, position){
	return XX(from, to, piece, position, 3);
}

export function NN(from, to, piece, position){
	return LL(from, to, piece, position, 1, 2);
}

export function CC(from, to, piece, position){
	return LL(from, to, piece, position, 1, 3);
}

export function ZZ(from, to, piece, position){
	return LL(from, to, piece, position, 2, 3);
}

export function QQ(from, to, piece, position){
	return WW(from, to, piece, position) || FF(from, to, piece, position);
}

// Hoppers

export function hopT(from, to, piece, position, R){
	const vector = vectorT(from, to, R);
	if(vector) return hop(from, to, piece, position, ... vector);
	return false;
}

export function hopX(from, to, piece, position, R){
	const vector = vectorX(from, to, R);
	if(vector) return hop(from, to, piece, position, ... vector);
	return false;
}

export function hopL(from, to, piece, position, A, B){
	const vector = vectorL(from, to, A, B);
	if(vector) return hop(from, to, piece, position, ... vector);
	return false;
}

export function hopW(from, to, piece, position){
	return hopT(from, to, piece, position, 1);
}

export function hopD(from, to, piece, position){
	return hopT(from, to, piece, position, 2);
}

export function hopH(from, to, piece, position){
	return hopT(from, to, piece, position, 3);
}

export function hopF(from, to, piece, position){
	return hopX(from, to, piece, position, 1);
}

export function hopA(from, to, piece, position){
	return hopX(from, to, piece, position, 2);
}

export function hopG(from, to, piece, position){
	return hopX(from, to, piece, position, 3);
}

export function hopN(from, to, piece, position){
	return hopL(from, to, piece, position, 1, 2);
}

export function hopC(from, to, piece, position){
	return hopL(from, to, piece, position, 1, 3);
}

export function hopZ(from, to, piece, position){
	return hopL(from, to, piece, position, 2, 3);
}

export function hopQ(from, to, piece, position){
	return hopW(from, to, piece, position) || hopF(from, to, piece, position);
}

// Pawn

export function pawn(from, to, pawn){
	if(from.to(-1, pawn.color.moveDir) === to)
		return true;
	if(from.to(1, pawn.color.moveDir) === to)
		return true;
	return false;
}
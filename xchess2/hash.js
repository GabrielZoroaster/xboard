
const MAX_GAP = 16;
let Hash = 1n;

function BitLength(value){
	let length = 0n;
	while(value){
		value >>= 1n;
		length ++;
	}	return length * 2n - 1n;
}

function Push(value){
	value = BigInt(value);
	Hash = (Hash << BitLength(value)) | value;
	return Hash;
}

function ReleaseHash(){
	const hash = Hash;
	Hash = 1n;
	return hash;
}

function PushColor(color){
	Push(color + 1);
}

function PushEnPassant(square){
	square ? Push(square + 2) : Push(1);
}

function PushCastling(castling){
	Push(castling.size + 1);
}

function PushPosition(position){
	function ReleaseGap(){
		if(gap > 0){
			Push(gap);
			gap = 0;
		}
	}

	function Gap(){
		if(gap === MAX_GAP){
			Push(MAX_GAP);
			gap = 1;
		} else gap ++;
	}

	function Piece(piece){
		ReleaseGap();
		Push(MAX_GAP + piece.code);
	}

	let gap = 0;
	for(const square of position.board){
		const piece = position.get(square);
		piece ? Piece(piece) : Gap();
	}
	ReleaseGap();
}

export function PositionToHash(position){
	PushPosition(state.position);
	return ReleaseHash();
}

export function StateToHash(state){
	PushColor(state.color)
	PushCastling(state.castling);
	PushEnPassant(state.enPassant);
	PushPosition(state.position);
	return ReleaseHash();
}
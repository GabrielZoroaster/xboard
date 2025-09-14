
const NONE = 0;
const FILE = 1;
const RANK = 2;
const FULL = 3;

export const DISAMBIGUATION = {NONE, FILE, RANK, FULL};

const DisambiguationMap = new WeakMap();

export function GetMoveDisambiguation(move){
	return DisambiguationMap.get(move);
}

function SetMoveDisambiguation(move, disambiguation){
	DisambiguationMap.set(move, disambiguation);
}

function MoveKey(move){
	if(move.promoteTo)
		return `${move.piece.moveLetter}-${move.to}-${move.promoteTo.moveLetter}`;
	return `${move.piece.moveLetter}-${move.to}`;
}

function * PieceMoves(moves){
	for(const move of moves)
		if(move.isPieceMove)
			yield move.unwrap();
}

function GroupPieceMoves(moves){
	return Map.groupBy(new Set(PieceMoves(moves)), MoveKey).values();
}

function ResolveDisambiguate(moves){
	// Index
	const FileIndex = new Map();
	const RankIndex = new Map();
	for(const move of moves){
		const {file, rank} = move.from;
		const fileCount = FileIndex.get(file) ?? 0;
		const rankCount = RankIndex.get(rank) ?? 0;
		FileIndex.set(file, fileCount + 1);
		RankIndex.set(rank, rankCount + 1);
	}
	// Resolve
	for(const move of moves){
		if(FileIndex.get(move.from.file) > 1){
			if(RankIndex.get(move.from.rank) > 1)
				SetMoveDisambiguation(move, FULL);
			else
				SetMoveDisambiguation(move, RANK);
		} else SetMoveDisambiguation(move, FILE);
	}
}

function SetGroupDisambiguate(moves){
	if(moves.length > 1){
		ResolveDisambiguate(moves);
	} else {
		for(const move of moves)
			SetMoveDisambiguation(move, NONE);
	}
}

export function DisambiguateMoves(moves){
	for(const squareMoves of GroupPieceMoves(moves))
		SetGroupDisambiguate(squareMoves);
}
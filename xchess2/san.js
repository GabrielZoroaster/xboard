
import {DISAMBIGUATION} from './move.disambiguation.js'

function FromHint(move){
	if(move.isCapture && move.piece.isPawn)
		return move.from.file;
	switch(move.disambiguation){
		case DISAMBIGUATION.NONE: return '';
		case DISAMBIGUATION.FILE: return move.from.file;
		case DISAMBIGUATION.RANK: return move.from.rank;
	}	return move.from;
}

function Capture(move){
	if(move.isCapture) return 'x';
	if(move.disambiguation !== DISAMBIGUATION.FILE)
		return '';
	if(move.to.board.maxFileLength > 1)
		return '-';
	return '';
}

function Join(... args){
	return args.join('');
}

export function PieceMoveToSAN(move, {pieceLetter = true} = {}){
	if(pieceLetter)
		return Join(move.piece.moveLetter, FromHint(move), Capture(move), move.to);
	return Join(FromHint(move), Capture(move), move.to);
}
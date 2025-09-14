
import {INVALID_MOVE_NOTATION} from './errors.js'

const QueenCastling = /^(?<QC>O-O-O|0-0-0)(?<Check>[+#])?$/;
const KingCastling = /^(?<KC>O-O|0-0)(?<Check>[+#])?$/;
const LongSAN = /^(?<Piece>[^-a-z0-9+#=]*)(?<FromFile>[a-wyz]+)??(?<FromRank>[1-9][0-9]*)?(?<Sep>[-x]?)(?<To>[a-wyz]+[1-9][0-9]*)([=/](?<Promotion>[^-a-z0-9+#=+]+))?(?<EnPassant>\s*e.p.?)?(?<Check>[+#])?$/;
const SAN = /^(?<Piece>[^-a-z0-9+#=]*)(?<FromFile>[a-wyz])?(?<FromRank>[1-9][0-9]*)?(?<Sep>[-x]?)(?<To>[a-wyz][1-9][0-9]*)([=/](?<Promotion>[^-a-z0-9+#=+]+))?(?<EnPassant>\s*e.p.?)?(?<Check>[+#])?$$/
const ICCF = /^(?<From>[0-9]+)-(?<To>[0-9]+)$/;

function ParseCastling(san){
	const result = QueenCastling.exec(san) ?? KingCastling.exec(san);
	if(result){
		const {QC, KC, Check} = result.groups;
		const move = {};
		if(QC)
			move.qc = true;
		if(KC)
			move.kc = true;
		if(Check === '+')
			move.check = true;
		if(Check === '#')
			move.checkmate = true;
		return move;
	}
}

function ParseICCF(value, game){
	const result = ICCF.exec(value);
	if(result){
		const {From, To} = result.groups;
		const from = game.board.req(From);
		const to = game.board.req(To);
		return {from, to};
	}
}

function ExecSAN(game, san){
	if(game.board.maxFileLength > 1)
		return LongSAN.exec(san);
	return SAN.exec(san);
}

function ParseSAN(san, game){
	const result = ExecSAN(game, san);
	const board = game.board;
	if(result){
		const {Piece, FromFile, FromRank, To, Sep, Promotion, Check, EnPassant} = result.groups;
		const move = {};
		move.piece = Piece;
		if(FromFile && FromRank)
			move.from = board.req(FromFile + FromRank);
		else if(FromFile)
			move.fromFile = board.reqFile(FromFile);
		else if(FromRank)
			move.fromRank = board.reqRank(FromRank);
		move.to = board.req(To);
		if(Sep === 'x')
			move.capture = true;
		if(Promotion)
			move.promoteTo = Promotion;
		if(Check === '+')
			move.check = true;
		if(Check === '#')
			move.checkmate = true;
		if(EnPassant)
			move.enPassant = true;
		return move;
	}
}

export function ParseMove(query, game){
	try {
		const move = ParseCastling(query) ?? ParseSAN(query, game) ?? ParseICCF(query, game);
		if(move) return move;
	} catch {
		throw INVALID_MOVE_NOTATION(query);
	}	throw INVALID_MOVE_NOTATION(query);
}
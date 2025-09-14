

function Header(width){
	if(width > 0)
		return '   ┌' + '───┬'.repeat(width - 1) + '───┐';
	return '   ┌┐';
}

function Footer(width){
	if(width > 0)
		return '   └' + '───┴'.repeat(width - 1) + '───┘';
	return '   └┘';
}

function Sep(width){
	if(width > 0)
		return '   ├' + '───┼'.repeat(width - 1) + '───┤';
	return '   ├┤';
}

function FileRules(files){
	return `    ${files.map(file => TrimCell(file.name)).join(' ')} `;
}

function GetSquareName(square){
	return square.toString();
}

function GetPieceSign(piece){
	return piece.sign ?? piece.fen;
}

function GetEmpty(square){
	return undefined;
}

function TrimCell(value){
	if(value === null)
		return '   ';
	if(value === undefined)
		return '   ';
	const cell = String(value);
	if(cell.length > 3)
		return cell.substring(0, 3);
	if(cell.length > 2)
		return cell;
	if(cell.length > 1)
		return `${cell} `;
	if(cell.length > 0)
		return ` ${cell} `;
	return '';
}

export function BoardToText(board, cellCb = GetSquareName){
	const lines = [];
	const rows = [];
	const sep = Sep(board.width);
	const fileRules = FileRules(board.files);
	lines.push(fileRules);
	lines.push(Header(board.width));
	for(const rank of board.ranks){
		const cells = [];
		const rankCell = TrimCell(rank.name);
		for(const file of board.files){
			const square = board.at(file.x, rank.y);
			const cell = cellCb(square, board);
			cells.push(`${TrimCell(cell)}│`);
		}
		if(board.width > 0)
			lines.push(rankCell + '│' + cells.join('') + rankCell);
		else
			lines.push(rankCell + '││' + rankCell);
		if(rank.y < board.height - 1)
			lines.push(sep);
	}
	lines.push(Footer(board.width));
	lines.push(fileRules);
	return lines.join('\n');
}

export function PositionToText(position, pieceCb = GetPieceSign, emptyCb = GetEmpty){
	return position.board.text((square) => {
		const piece = position.get(square);
		if(piece) return pieceCb(piece, square, position);
		return GetEmpty(square, position);
	});
}

export function INVALID_BOARD(value){
	return new TypeError('Invalid board value');
}

export function INVALID_BOARD_WIDTH(value){
	return new TypeError('Width must be an integer number');
}

export function INVALID_BOARD_HEIGHT(value){
	return new TypeError('Width cannot be negative');
}

export function NEGATIVE_BOARD_WIDTH(value){
	return new TypeError('Height must be an integer number');
}

export function NEGATIVE_BOARD_HEIGHT(value){
	return new TypeError('Height cannot be negative');
}

export function INVALID_PIECES(){
	return new TypeError('Invalid value: expected Piece, PieceTypes, or iterable of them');
}

export function DUPLICATE_PIECE_IDENTIFIER(value){
	return new Error(`Duplicate piece identifier '${value}'`);
}

export function INVALID_COLOR(value){
	return new TypeError(`Invalid color value`);
}

export function INVALID_COLOR_OR_COLOR_LIST(value){
	return new TypeError(`The provided value is neither a valid color nor an iterable containing a valid combination of these colors`);
}

export function INVALID_SQUARE(value){
	return new TypeError(`Invalid square value`);
}

export function INVALID_FILE(value){
	return new TypeError(`Invalid file value`);
}

export function INVALID_RANK(value){
	return new TypeError(`Invalid rank value`);
}

export function INVALID_PIECE(value){
	return new TypeError('Invalid piece value');
}

export function INVALID_PIECE_TYPE(value){
	return new TypeError(`Invalid bestiary entry: expected a domain name, full ID, piece class, alias map, or iterable`);
}

export function INVALID_PIECE_COLOR(color){
	return new Error(`Required ${color} piece`);
}

export function INVALID_PIECE_TYPE_ID(value){
	return new TypeError(`Invalid piece type id '${value}'`);
}

export function UNSUPPORTED_PIECE_TYPE(typeName){
	throw new TypeError(`Unsupported piece type: ${typeName}`);
}

export function DUPLICATE_PIECE_TYPE_ID(value){
	return new TypeError(`Duplicate piece type id '${value}'`);
}

export function UNKNOWN_PIECE_TYPE_ID(value){
	return new TypeError(`The ID "${value}" does not correspond to any known piece or bestiary entry`);
}

export function INVALID_PIECE_FEN(fen){
	return new TypeError(`FEN symbol must be of type string`);
}

export function EMPTY_PIECE_FEN(fen){
	return new TypeError(`FEN symbol must not be empty`);
}

export function INVALID_POSITION(){
	return new TypeError('Invalid position value');
}

export function INVALID_RULES(){
	return new TypeError('Invalid rules value');
}

export function INVALID_META_TAGS(tag){
	return new TypeError(`invalid meta tags value`);
}

export function INVALID_META_TAG(tag){
	return new TypeError(`invalid meta tag '${tag}'`);
}

export function INVALID_META_VALUE(value){
	return new TypeError(`invalid meta value '${value}'`);
}

export function INVALID_GAME_CONFIG(value){
	return new TypeError('Invalid game configuration: expected a FEN string or a valid game settings object');
}

export function INVALID_CASTLING(value){
	return new TypeError('');
}

export function INVALID_FULLMOVE_NUMBER(value){
	return new TypeError('Invalid fullmoveNumber: must be an integer greater than or equal to 1');
}

export function INVALID_HALFMOVE_CLOCK(value){
	return new TypeError('Invalid halfmoveClock: must be an integer greater than or equal to 0');
}

export function INVALID_MOVE(value){
	return new TypeError('Invalid move argument');
}

export function INVALID_MOVE_NOTATION(value){
	return new TypeError(`Invalid move notation '${value}'`);
}

export function EDIT_LOCKED(){
	return new Error('Editing is not allowed outside of setup state');
}

export function PGN_LOCKED(){
	return new Error('Cannot generate PGN while the game is in setup state');
}

export function PLAY_LOCKED(){
	return new Error('Playing moves is not permitted in the setup state');
}

export function MOVE_LOCKED(){
	return new Error('Cannot make a move in the current game state');
}

export function PROMOTE_LOCKED(){
	return new Error('Cannot promote a piece outside of a promotion state');
}

export function META_LOCKED() {
	return new Error('Meta-event is not allowed in the current state');
}

export function GAME_OVER(){
	return new Error('Action not allowed: the game is over');
}

export function EMPTY_SQUARE(square){
	return new Error(`No piece found at square '${square}'`);
}

export function MOVE_NOT_FOUND(query){
	return new Error(`The specified move is not legal in the current state`);
}

export function AMBIGUOUS_MOVE(query){
	return new Error(`Ambiguous move: multiple legal candidates found`);
}

export function INVALID_PROMOTION_CHOICE(){
	return new Error(`The selected piece is not a valid promotion choice`);
}

export function INVALID_NAG(value){
	return new TypeError('Invalid NAG value');
}

export function INVALID_CASTLING_ALIGNMENT(){
	return new Error('Castling squares must be aligned on a single rank or file');
}

export function INVALID_CASTLING_SQUARES(){
	return new Error('A castling configuration has overlapping squares');
}

export function INCOMPATIBLE_BOARD_SIZE(board){
	return new Error('Cannot generate setup: incompatible board size');
}

export function BOARD_PACK_OVERFLOW(maxPackedLength){
	return new Error(`Too many squares to pack: maximum allowed is ${maxPackedLength}`)
}

export function INVALID_BOARD_PACK_STRING(value){
	return new Error('unpackString: invalid format');
}
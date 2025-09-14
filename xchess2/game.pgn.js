
import {Writer} from './pgn/writer.js'
import {PGN_LOCKED} from './errors.js'

export function GameToPGN(game){

	if(game.isSetup) throw PGN_LOCKED();

	const writer = new Writer();

	for(const [name, value] of game.tags)
		writer.tag(name, value);

	const start = game.first;

	writer.setColor(start.color);
	writer.setNumber(start.fullmoveNumber);

	let event = start;

	while(event = event.nextEvent){
		if(event.type === 'move')
			writer.move(event.toSAN());
		else if(event.type === 'comment')
			writer.comment(event.comment);
		// else if(event.type === 'nag')
			// writer.nag(event.code);
	}

	writer.result(game.last.result.pgn);

	return writer.release();
}
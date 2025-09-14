
import {BoardNode} from './board.node.js'

export class Grid extends BoardNode {

	constructor(context){
		super(context);
		this.class.add('grid');
		this.on('pointermove', event => this.pointerMove(event));
		this.on('pointerleave', event => this.pointerLeave(event));
	}

	pointerMove(event){
		const square = this.context.at(event);
		if(square)
			this.context.squares.showTarget(square);
		else
			this.context.squares.hideTarget();
	}

	pointerLeave(event){
		this.context.squares.hideTarget();
	}
}
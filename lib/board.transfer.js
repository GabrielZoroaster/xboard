
import {DragProvider, DragReceiver} from './transfer.js'

export class BoardDragProvider extends DragProvider {

	#target;

	constructor(pieceNode){
		super(pieceNode.piece, pieceNode.context);
		this.#target = pieceNode;
	}

	get target(){
		return this.#target;
	}

	click(event){
		this.target.click(event);
	}

	drag(event){
		this.target.drag(event);
	}

	drop(event){
		this.widget.board.class.add('transfer-provider');
	}

	move(event){
		this.target.dragTo(event);
		this.widget.board.class.remove('transfer-provider');
	}

	offer(context){
		if(context.isOwn)
			context.accept();
		else if(this.widget.canExport(context.piece))
			context.accept();
		else
			context.reject();
	}

	accept(context){
		if(context.isOwn){
			this.target.drop();
		} else {
			const square = this.widget.game.position.find(this.piece);
			if(square)
				this.widget.game.position.delete(square);
		}
	}

	reject(){
		this.target.drop();
	}
}

export class BoardDragReceiver extends DragReceiver {

	constructor(context){
		super(context.bus.drag, context.grid, context);
	}

	receive(transfer, event){
		const piece = transfer.piece;
		const square = this.widget.at(event);
		if(square){
			const pieceNode = this.widget.pieces.get(piece);
			if(pieceNode){
				if(this.widget.canMove(piece, square)){
					transfer.accept();
					this.widget.move(pieceNode.square, square);
				}
			} else {
				if(this.widget.canImport(piece, square)){
					transfer.accept();
					this.widget.import(piece, square, event);
				}
			}
		}
	}
}
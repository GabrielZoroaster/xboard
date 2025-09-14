
import {BoardNode} from './board.node.js'

export class Dialog extends BoardNode {

	#target = null;

	constructor(context){
		super(context);
		this.class.add('dialog');
		this.hide();
	}

	get target(){
		return this.#target;
	}

	close(){
		if(this.target){
			this.target.remove();
			this.#target = null;
			this.hide();
			return true;
		}	return false;
	}

	#open(target){
		if(this.target !== target){
			if(this.target)
			 	this.target.replace(target);
			else {
				this.append(target);
				this.show();
			}
			this.#target = target;
		}
	}

	promotion(promotes, color){
		this.#open(new PromotionTarget(this, promotes, color));
	}
}

class DialogTarget extends BoardNode {

	#dialog;

	constructor(dialog){
		super(dialog.context);
		this.#dialog = dialog;
		this.class.add('dialog-target');
	}

	get dialog(){
		return this.#dialog;
	}
}

function GridRect(W, H, N){
	const R = W / H;
	let DW = Math.ceil(Math.sqrt(N * R));
	let DH = Math.ceil(N / DW);
	while((DW - 1) * DH >= N)
		DW --;
	return [DW, DH];
}

class PromotionTarget extends DialogTarget {

	constructor(dialog, promotes, color){
		super(dialog);
		this.class.add('promotion');
		this.fill(promotes, color);
		this.setLayout(promotes.length);
	}

	fill(promotes, color){
		for(const type of promotes)
			this.append(new PieceTypeNode(this.context, type, color));
	}

	setLayout(length){
		const {width, height} = this.context.game.board;
		const [W, H] = GridRect(width, height, length);
		this.style.setProperty('--cols', W);
		this.style.setProperty('--rows', H);
	}
}

class PieceTypeNode extends BoardNode {

	#type;
	#color;

	constructor(context, type, color){
		super(context);
		this.#type = type;
		this.#color = color;
		this.class.add('promotion-type');
		this.class.add(this.type.id);
		this.class.add(this.color.name);
		this.on('click', () => this.promote());
	}

	get type(){
		return this.#type;
	}

	get color(){
		return this.#color;
	}

	promote(){
		this.context.game.promote(new this.type(this.color));
	}
}
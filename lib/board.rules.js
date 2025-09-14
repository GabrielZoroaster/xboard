
import {BoardNode} from './board.node.js'
import {Node} from './node.js'

export class RuleSet extends BoardNode {

	#left = new RankRule(this.context);
	#right = new RankRule(this.context);
	#top = new FileRule(this.context);
	#bottom = new FileRule(this.context);

	constructor(context){
		super(context);
		this.class.add('rules');
		this.left.class.add('left');
		this.right.class.add('right');
		this.top.class.add('top');
		this.bottom.class.add('bottom');
		this.append(this.left, this.right, this.top, this.bottom);
	}

	get left(){
		return this.#left;
	}

	get right(){
		return this.#right;
	}

	get top(){
		return this.#top;
	}

	get bottom(){
		return this.#bottom;
	}

	fill(board){
		this.left.fill(board.ranks);
		this.right.fill(board.ranks);
		this.top.fill(board.files);
		this.bottom.fill(board.files);
	}

	clear(){
		this.left.clear();
		this.right.clear();
		this.top.clear();
		this.bottom.clear();
	}

	sync(){
		this.left.sync();
		this.right.sync();
		this.top.sync();
		this.bottom.sync();
	}
}

export class Rule extends BoardNode {

	constructor(context){
		super(context);
		this.class.add('rule');
	}

	fill(axes){
		// abstract
	}

	sync(){
		for(const axisNode of this.ls)
			axisNode.sync();
	}

	clear(){
		this.ls.clear();
	}
}

export class FileRule extends Rule {

	constructor(context){
		super(context);
		this.class.add('files');
	}

	fill(files){
		for(const file of files)
			this.append(new FileNode(this.context, file));
	}
}

export class RankRule extends Rule {

	constructor(context){
		super(context);
		this.class.add('ranks');
	}

	fill(ranks){
		for(const rank of ranks)
			this.append(new RankNode(this.context, rank));
	}
}

export class AxisNode extends BoardNode {

	#target;

	constructor(context, target){
		super(context);
		this.#target = target;
		this.class.add('axis');
		this.append(new Node({text: this.target}));
		this.sync();
	}

	get target(){
		return this.#target;
	}

	sync(){
		// abstract
	}
}

export class FileNode extends AxisNode {

	constructor(context, target){
		super(context, target);
		this.class.add('file');
	}

	sync(){
		this.style.gridArea = `1/${this.topology.x(this.target) + 1}`;
	}
}

export class RankNode extends AxisNode {

	constructor(context, target){
		super(context, target);
		this.class.add('rank');
	}

	sync(){
		this.style.gridArea = `${this.topology.y(this.target) + 1}/1`;
	}
}
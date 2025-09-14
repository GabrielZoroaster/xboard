
import {BoardNode} from './board.node.js'
import {Node} from './node.js'

function PX(value){
	return `${value}px`;
}

function Persent(value){
	return `${value * 100}%`;
}

function SyncArrow(arrow){
	const {from, to, arrows: {topology}} = arrow;
	const [x, y] = topology.center(from);
	const length = topology.distance(from, to);
	const angle = topology.angle(from, to);
	const dy = arrow.tag.offsetHeight / 2;
	arrow.style.left = Persent(x);
	arrow.style.top = Persent(y);
	arrow.style.width = Persent(length/topology.board.width);
	arrow.style.transform = `translateY(-50%) rotate(${angle}deg)`;
}

function ArrowsFrom(board, entries){
	const arrows = [];
	for(const [key, type] of Object.entries(entries)){
		const path = board.unpackString(key);
		if(path.length !== 2)
			throw new TypeError(`Invalid arrow key '${key}'`);
		arrows.push([... path, String(type)]);
	} return arrows;
}

export class Arrow extends Node {

	#arrows;
	#from;
	#to;
	#type;
	#id;

	constructor(arrows, from, to, type){
		super();
		this.#arrows = arrows;
		this.#from = from;
		this.#to = to;
		this.#type = String(type);
		this.#id = this.arrows.keyOf(this.from, this.to);
		this.class.add('arrow');
		this.class.add(this.type);
	}

	get arrows(){
		return this.#arrows;
	}

	get from(){
		return this.#from;
	}

	get to(){
		return this.#to;
	}

	get type(){
		return this.#type;
	}

	get id(){
		return this.#id;
	}

	stringID(){
		return [this.from, this.to].join('');
	}

	set type(type){
		this.class.remove(this.type);
		this.#type = String(type);
		this.class.add(this.type);
	}

	sync(){
		SyncArrow(this);
	}
}

export class ArrowSet extends BoardNode {

	#arrows = new Map();

	constructor(context){
		super(context);
		this.class.add('arrows');
	}

	* [Symbol.iterator](){
		yield * this.#arrows.values();
	}

	get size(){
		return this.#arrows.size;
	}

	keyOf(from, to){
		return this.topology.board.pack(from, to);
	}

	getArrow(from, to){
		return this.#arrows.get(this.keyOf(from, to));
	}

	get(from, to){
		const arrow = this.getArrow(from, to);
		if(arrow) return arrow.type;
		return null;
	}

	has(from, to){
		return this.#arrows.has(this.keyOf(from, to));
	}

	#set(from, to, type){
		const arrow = new Arrow(this, from, to, type);
		this.#arrows.set(arrow.id, arrow);
		this.append(arrow);
		arrow.sync();
	}

	set(from, to, type){
		const arrow = this.getArrow(from, to);
		if(arrow)
			arrow.type = type;
		else
			this.#set(from, to, type);
	}

	delete(from, to){
		const arrow = this.getArrow(from, to);
		if(arrow){
			this.#arrows.delete(arrow.id);
			arrow.remove();
			return true;
		}	return false;
	}

	setAll(arrows){
		const all = ArrowsFrom(this.topology.board, arrows);
		this.clear();
		for(const [from, to, type] of all)
			this.#set(from, to, type);
	}

	clear(){
		this.ls.clear();
		this.#arrows.clear();
	}

	sync(){
		for(const arrow of this)
			arrow.sync();
	}

	toJSON(){
		const json = {};
		for(const arrow of this)
			json[arrow.stringID()] = arrow.type;
		return json;
	}
}
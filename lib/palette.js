
import {Node} from './node.js'
import {Bestiary, Color} from '../xchess2/index.js'
import {GlobalBus, DragProvider, DragReceiver, PickProvider} from './transfer.js'

class PaletteItem extends Node {

	#palette;

	constructor(palette){
		super();
		this.#palette = palette;
	}

	get palette(){
		return this.#palette;
	}

	get selected(){
		return this.palette.bus.pick.hasHandler(this);
	}

	match(piece){
		return false;
	}

	click(){
		this.toggle();
	}

	select(){
		// abstract
	}

	unselect(){
		this.palette.bus.pick.unpublish(this);
	}

	toggle(){
		this.selected ? this.unselect() : this.select();
	}
}

class DeletePiece extends PaletteItem {

	constructor(palette){
		super(palette);
		this.class.add('delete-piece');
		this.on('click', () => this.click());
	}

	select(){
		this.palette.bus.pick.publish(new DeleteProvider(this));
	}
}

class InsertPiece extends PaletteItem {

	#type;
	#color;

	constructor(palette, type, color){
		super(palette);
		this.#type = type;
		this.#color = color;
		this.class.add('insert-piece');
		this.class.add(this.type.id);
		this.class.add(this.color.name);
		this.on('pointerdown', event => this.touch(event));
	}

	get type(){
		return this.#type;
	}

	get color(){
		return this.#color;
	}

	piece(){
		return new this.type(this.color);
	}

	match(piece){
		return (piece instanceof this.type) && this.color.eq(piece.color);
	}

	reset(){
		const typeNode = new InsertPiece(this.palette, this.type, this.color);
		this.replace(typeNode);
		if(this.selected) typeNode.select();
	}

	touch(event){
		const vp = this.vp;
		const cx = vp.x + vp.width / 2;
		const cy = vp.y + vp.height / 2;
		this.palette.bus.drag.publish(new PaletteDragProvider(this, cx, cy), event);
	}

	select(){
		this.palette.bus.pick.publish(new InsertProvider(this));
	}

	drag(x, y){
		this.class.add('transfer');
		this.dragTo(x, y);
	}

	dragTo(x, y){
		this.style.transform = `translate(${x}px, ${y}px)`;
	}

	drop(){
		this.style.removeProperty('transform');
		this.class.remove('transfer');
	}

	jump(event){
		const vp = this.vp;
		const x = event.clientX - vp.x - vp.width/2;
		const y = event.clientY - vp.y - vp.height/2;
		this.drag(x, y);
		setTimeout(() => this.drop(), 10);
	}
}

class PalettePickProvider extends PickProvider {

	#target;

	constructor(target){
		super();
		this.#target = target;
	}

	get target(){
		return this.#target;
	}

	hasHandler(handler){
		if(this.target === handler)
			return true;
		if(this.target.palette === handler)
			return true;
		return false;
	}

	focus(){
		this.target.class.add('current');
	}

	reject(){
		this.target.class.remove('current');
	}
}

class DeleteProvider extends PalettePickProvider {

	isDelete(){
		return true;
	}
}

class InsertProvider extends PalettePickProvider {

	isInsert(){
		return true;
	}

	release(){
		return this.target.piece();
	}
}

class PaletteDragProvider extends DragProvider {

	#target;
	#x;
	#y;

	constructor(target, x, y){
		super(target.piece(), target.palette);
		this.#target = target;
		this.#x = x + window.scrollX;
		this.#y = y + window.scrollY;
	}

	get target(){
		return this.#target;
	}

	get x(){
		return this.#x;
	}

	get y(){
		return this.#y;
	}

	click(event){
		this.target.click();
	}

	drag(event){
		this.target.drag(event.pageX - this.x, event.pageY - this.y);
		this.widget.class.add('transfer-provider');
	}

	drop(){
		this.widget.class.remove('transfer-provider');
	}

	move(event){
		this.target.drag(event.pageX - this.x, event.pageY - this.y);
	}

	accept(){
		this.target.reset();
	}

	reject(){
		this.target.drop();
	}
}

class PaletteDragReceiver extends DragReceiver {

	constructor(palette){
		super(palette.bus.drag, palette, palette);
	}

	find(piece){
		return this.widget.ls.find(node => node.match(piece));
	}

	jump(piece, event){
		const typeNode = this.find(piece);
		if(typeNode) typeNode.jump(event);
	}

	receive(context, event){
		if(!context.isOwn){
			context.accept();
			this.jump(context.piece, event);
		} else context.reject();
	}
}

export class Palette extends Node {

	#bestiary;
	#bus;

	constructor(bestiary, bus = GlobalBus){
		super();
		this.#bus = bus;
		this.bestiary = bestiary;
		this.class.add('xboard-palette');
		new PaletteDragReceiver(this);
	}

	get bus(){
		return this.#bus;
	}

	get bestiary(){
		return this.#bestiary;
	}

	set bestiary(value){
		const bestiary = Bestiary.from(value);
		if(this.bestiary !== bestiary){
			this.#bestiary = bestiary;
			this.unselect();
			this.#fill(this.bestiary);
		}
	}

	unselect(){
		this.bus.pick.unpublish(this);
	}

	#fill(bestiary){
		this.ls.clear();
		this.append(new DeletePiece(this));
		for(const type of bestiary)
			for(const color of Color.all())
				this.append(new InsertPiece(this, type, color));
	}
}
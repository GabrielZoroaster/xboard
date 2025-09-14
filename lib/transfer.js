
// Transfer Bus

export class TransferBus {

	static from(bus){
		if(bus instanceof TransferBus)
			return bus;
		throw new Error('invalid bus');
	}

	#drag = new DragBus();
	#pick = new PickBus();

	get drag(){
		return this.#drag;
	}

	get pick(){
		return this.#pick;
	}
}

// Pick Transfer

export class PickBus {

	#provider = IdlePickProvider;

	publish(provider){
		if(!PickProvider.is(provider))
			throw new Error('invalid provider');
		if(this.#provider !== provider){
			this.#provider.reject();
			this.#provider = provider;
			this.#provider.focus();
		}
	}

	unpublish(handler){
		if(this.hasHandler(handler))
			this.clear();
	}

	hasHandler(handler){
		return this.#provider.hasHandler(handler);
	}

	clear(){
		if(this.has()){
			this.#provider.reject();
			this.#provider = IdlePickProvider;
			return true;
		}	return false;
	}

	has(){
		return this.#provider !== IdlePickProvider;
	}

	isDelete(){
		return this.#provider.isDelete();
	}

	isInsert(){
		return this.#provider.isInsert();
	}

	focus(){
		this.#provider.focus();
	}

	release(){
		return this.#provider.release();
	}
}

export class PickProvider {

	static is(provider){
		return provider instanceof PickProvider;
	}

	hasHandler(handler){
		return false
	}

	isDelete(){
		return false;
	}

	isInsert(){
		return false;
	}

	release(){
		return null;
	}

	focus(){
		// abstract event
	}

	reject(){
		// abstract event
	}
}

const IdlePickProvider = new PickProvider();

// Drag Transfer

const DRAG_TRANSFER_BODY_CLASSNAME = 'xboard-piece-transfer';

function CaptureDragTransfer(){
	document.body.classList.add(DRAG_TRANSFER_BODY_CLASSNAME);
}

function ReleaseDragTransfer(){
	document.body.classList.remove(DRAG_TRANSFER_BODY_CLASSNAME);
}

export class DragBus {

	#context;

	constructor(root = window){
		this.#context = new DragBusContext(this, root);
	}

	get piece(){
		return this.#context.piece;
	}

	get busy(){
		return this.#context.busy;
	}

	get state(){
		return this.#context.state;
	}

	get isOwn(){
		return this.#context.isOwn;
	}

	// Provider

	hasProvider(provider){
		return this.#context.hasProvider(provider);
	}

	publish(provider, event){
		this.#context.publish(provider, event);
	}

	unpublish(provider){
		this.#context.unpublish(provider);
	}

	// Receiver

	hasReceiver(receiver){
		return this.#context.hasReceiver(receiver);
	}

	offer(receiver, event){
		this.#context.offer(receiver, event);
	}
}

class DragBusContext {

	#bus;
	#root;
	#transfer = IDLE_DRAG_TRANSFER;

	constructor(bus, root){
		this.#bus = bus;
		this.#root = root;
		this.root.addEventListener('pointerup', event => this.pointerUp(event));
		this.root.addEventListener('pointercancel', event => this.pointerCancel(event));
		this.root.addEventListener('pointermove', event => this.pointerMove(event));
	}

	get bus(){
		return this.#bus;
	}

	get root(){
		return this.#root;
	}

	get transfer(){
		return this.#transfer;
	}

	get piece(){
		return this.#transfer.piece;
	}

	get busy(){
		return this.#transfer.busy;
	}

	get state(){
		return this.#transfer.state;
	}

	get isOwn(){
		return this.#transfer.isOwn;
	}

	// Pointer Events

	match(event){
		return this.#transfer.match(event);
	}

	pointerUp(event){
		if(this.match(event)){
			event.preventDefault();
			event.stopPropagation();
			const receiver = DragReceiver.at(event);
			if(receiver)
				this.offer(receiver, event);
			else
				this.transfer.reject();
		}
	}

	pointerCancel(event){
		if(this.match(event)){
			event.preventDefault();
			event.stopPropagation();
			this.transfer.reject();
		}
	}

	pointerMove(event){
		if(this.match(event)){
			event.preventDefault();
			event.stopPropagation();
			this.transfer.move(event);
		}
	}

	// Provider

	hasProvider(provider){
		return this.transfer.hasProvider(provider);
	}

	publish(provider, event){
		if(!this.hasProvider(provider)){
			this.transfer.reject();
			this.#transfer = new DragTransfer(this, provider, event);
			this.transfer.drag(event);
			event.stopPropagation();
			event.preventDefault();
			CaptureDragTransfer();
		}
	}

	unpublish(provider){
		if(this.hasProvider(provider))
			this.transfer.reject();
	}

	// Receiver

	hasReceiver(receiver){
		return this.transfer.hasReceiver(receiver);
	}

	offer(receiver, event){
		this.transfer.offer(receiver, event);
	}

	// Transfer Events

	free(){
		this.#transfer = IDLE_DRAG_TRANSFER;
		ReleaseDragTransfer();
	}
}

class IdleDragTransfer {

	get piece(){
		return null;
	}

	get busy(){
		return false;
	}

	get state(){
		return Idle;
	}

	get isOwn(){
		return false;
	}

	// Bus Events

	match(event){
		return false;
	}

	drag(event){
		// do nothing
	}

	move(event){
		// do nothing
	}

	hasProvider(provider){
		return false;
	}

	hasReceiver(receiver){
		return false;
	}

	offer(receiver, event){
		// do nothing
	}

	reject(){
		// do nothing
	}
}

const IDLE_DRAG_TRANSFER = new IdleDragTransfer();

const Idle = 'Idle';
const Pending = 'Pending';
const Dragging = 'Dragging';
const WaitingProvider = 'WaitingProvider';
const WaitingReceiver = 'WaitingReceiver';
const Resolved = 'Resolved';

const DRAG_THRESHOLD = 1;
const DRAG_THRESHOLD2 = DRAG_THRESHOLD ** 2;

class DragTransfer {

	#context;
	#provider;
	#pointerId;
	#startX;
	#startY;
	#state = Pending;
	#receiver = null;
	#downEvent = null;
	#providerHandle = null;

	constructor(context, provider, event){
		this.#context = context;
		this.#provider = provider;
		this.#pointerId = event.pointerId;
		this.#startX = event.clientX;
		this.#startY = event.clientY;
	}

	get context(){
		return this.#context;
	}

	get bus(){
		return this.#context.bus;
	}

	get provider(){
		return this.#provider;
	}

	get pointerId(){
		return this.#pointerId;
	}

	get startX(){
		return this.#startX;
	}

	get startY(){
		return this.#startY;
	}

	get piece(){
		return this.#provider.piece;
	}

	get state(){
		return this.#state;
	}

	get busy(){
		return true;
	}

	get receiver(){
		return this.#receiver;
	}

	get downEvent(){
		return this.#downEvent;
	}

	get providerHandle(){
		return this.#providerHandle;
	}

	get isOwn(){
		return this.receiver && (this.provider.widget === this.receiver.widget);
	}

	isPending(){
		return this.state === Pending;
	}

	get isDragging(){
		return this.state === Dragging;
	}

	get isWaitingProvider(){
		return this.state === WaitingProvider;
	}

	get isWaitingReceiver(){
		return this.state === WaitingReceiver;
	}

	get isResolved(){
		return this.state === Resolved;
	}

	dragTest(event){
		if(this.isPending){
			const dx = event.clientX - this.startX;
			const dy = event.clientY - this.startY;
			if(dx ** 2 + dy ** 2 > DRAG_THRESHOLD2)
				this.#state = Dragging;
		}
	}

	// Bus Events

	match(event){
		return this.pointerId === event.pointerId;
	}

	drag(event){
		this.provider.drag(event);
	}

	move(event){
		this.dragTest(event);
		this.provider.move(event);
	}

	hasProvider(provider){
		return this.provider === provider;
	}

	hasReceiver(receiver){
		return this.receiver && (this.receiver === receiver);
	}

	offer(receiver, event){
		if(this.match(event)){
			if(this.isDragging){
				this.#receiver = receiver;
				this.#downEvent = event;
				this.#state = WaitingProvider;
				this.#providerHandle = new DragProviderTransfer(this);
				this.provider.offer(this.providerHandle);
				this.allow();
			} else if(this.isPending){
				this.reject();
				this.provider.click(event);
			}
		}
	}

	allow(){
		if(this.isWaitingProvider){
			this.#state = WaitingReceiver;
			this.receiver.receive(new DragReceiverTransfer(this), this.downEvent);
			this.reject();
		}
	}

	accept(){
		if(this.isWaitingReceiver){
			this.#state = Resolved;
			this.provider.accept(this.providerHandle, this.downEvent);
			this.provider.drop(this.downEvent);
			this.context.free();
		}
	}

	reject(){
		if(!this.isResolved){
			this.#state = Resolved;
			this.provider.reject(this.providerHandle, this.downEvent);
			this.provider.drop(this.downEvent);
			this.context.free();
		}
	}
}


class DragProviderTransfer {

	#target;

	constructor(target){
		this.#target = target;
	}

	get bus(){
		return this.#target.bus;
	}

	get piece(){
		return this.#target.piece;
	}

	get state(){
		return this.#target.state;
	}

	get isOwn(){
		return this.#target.isOwn;
	}

	accept(){
		this.#target.allow(this);
	}

	reject(){
		this.#target.reject();
	}
}

class DragReceiverTransfer {

	#target;

	constructor(target){
		this.#target = target;
	}

	get bus(){
		return this.#target.bus;
	}

	get piece(){
		return this.#target.piece;
	}

	get state(){
		return this.#target.state;
	}

	get isOwn(){
		return this.#target.isOwn;
	}

	accept(){
		this.#target.accept();
	}

	reject(){
		this.#target.reject();
	}
}

export class DragProvider {

	#piece;
	#widget;

	constructor(piece, widget){
		this.#piece = piece;
		this.#widget = widget;
	}

	get piece(){
		return this.#piece;
	}

	get widget(){
		return this.#widget;
	}

	click(event){
		// Override in subclass: click event
	}

	drag(event){
		// Override in subclass: initialize drag state if needed
	}

	drop(event){
		// Override in subclass: end drag state if needed
	}

	move(event){
		// Override in subclass: update piece position visually
	}

	offer(transfer, event){
    // Override in subclass: respond to a drop attempt, call transfer.accept() or transfer.reject()
	}

	accept(transfer, event) {
		// Override in subclass: finalize drag, commit piece placement
	}

	reject(transfer, event) {
		// Override in subclass: revert piece to original position or cancel drag
	}
}

const RECEIVER_MAP = new WeakMap();

function FindReceiverFrom(event){
	let tag = document.elementFromPoint(event.clientX, event.clientY);
	while(tag){
		if(RECEIVER_MAP.has(tag))
			return RECEIVER_MAP.get(tag);
		tag = tag.parentNode;
	}	return null;
}

export class DragReceiver {

	static at(event){
		return FindReceiverFrom(event);
	}

	#bus;
	#target;
	#widget;

	constructor(bus, target, widget){
		this.#bus = bus;
		this.#target = target;
		this.#widget = widget;
		RECEIVER_MAP.set(this.target.tag, this);
	}

	get bus(){
		return this.#bus;
	}

	get target(){
		return this.#target;
	}

	get widget(){
		return this.#widget;
	}

	receive(transfer, event){
    // Override in subclass: handle offered piece, call transfer.accept() or transfer.reject()
	}
}

// Global Bus
export const GlobalBus = new TransferBus();
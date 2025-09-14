
export {$, Node, NodeIterator, NodeLS, AttributeMap}

const Nodes = new WeakMap();
const DefaultTagName = 'div';
const DefaultDocument = document;
const Observer = new MutationObserver(OnNodeMutation);
const NodeListeners = new WeakMap();

function IsNull(value){
	return value === null;
}

function IsString(value){
	return typeof value === 'string';
}

function IsObject(value){
	return !IsNull(value) && typeof value === 'object';
}

function IsFunction(value){
	return typeof value === 'function';
}

function IsIterable(value){
	return IsObject(value) && IsFunction(value[Symbol.iterator]);
}

function IsTag(tag){
	return tag instanceof Element;
}

function IsCSSStyleDeclaration(value){
	return value instanceof CSSStyleDeclaration;
}

function IsAttributeMap(attrs){
	if(attrs instanceof AttributeMap)
		return true;
	if(attrs instanceof NamedNodeMap)
		return true;
	return false;
}

function IsDOMStringMap(value){
	return value instanceof IsDOMStringMap;
}

function InvalidNode(){
	return new TypeError('Expected a Node instance');
}

function InvalidNodeArg(){
	return new TypeError("Expected a Node, Element, Object, or a string representing a tag name");
}

function InvalidWrapTarget(){
	return new TypeError("Expected a CSS selector (string), a DOM element, or a Node instance");
}

function InvalidWrapAllTarget(){
	return new TypeError("Expected a selector (string) or an iterator where each element is a Node, Element, or selector string");
}

function * $Next(arg){
	if(IsString(arg))
		yield * Node.queryAll(arg);
	else if(IsObject(arg)){
		if(IsTag(arg))
			yield WrapTag(arg);
		else if(Node.is(arg))
			yield arg;
		else if(IsIterable(arg))
			yield * $For(arg);
		else
			yield new Node(arg);
	}
}

function * $For(args){
	for(const arg of args) yield * $Next(arg);
}

function $(... args){
	return NodeIterator.from($For(args));
}

function TryUnwrap(node){
	try {
		return Node.tag(node);
	} catch {
		return node;
	}
}

function Unwrap(node){
	if(Node.is(node))
		return node.tag;
	if(IsTag(node))
		return node;
	if(IsObject(node))
		return (new Node(node)).tag;
	if(IsString(node))
		return (new Node({name: node})).tag;
	throw InvalidNodeArg();
}

function WrapTag(tag){
	return Node.of(tag) ?? new Node({tag});
}

function Wrap(tag){
	return tag ? WrapTag(tag) : null;
}

function * WrapAll(tags){
	for(const tag of tags)
		yield WrapTag(tag);
}

function WrapIterator(tags){
	return new NodeIterator(WrapAll(tags));
}

function SearchTag(target){
	if(IsString(target))
		return document.querySelector(target);
	if(IsTag(target))
		return target;
	if(Node.is(target))
		return target.tag;
	throw InvalidWrapTarget();
}

function * Take(target, limit){
	for(const node of target)
		if(limit -- > 0)
			yield node;
		else break;
}

function * Drop(target, limit){
	while(limit -- > 0)
		target.next();
	yield * target;
}

function * Filter(target, cb){
	let index = 0;
	for(const node of target)
		if(cb(node, index ++))
			yield node;
}

function Reduce(target, cb, ... args){
	if(args.length > 0){
		let index = 0;
		let [value] = args;
		for(const node of target)
			value = cb(value, node, index ++);
		return value;
	} else {
		let value;
		let index = -1;
		for(const node of target){
			if(index < 0)
				value = node;
			else
				value = cb(value, node, index);
			index ++;
		}
		return value;
	}
}

function * SearchTagAll(target){
	if(IsString(target))
		yield * document.querySelectorAll(target);
	else if(IsIterable(target))
		for(const next of target)
			yield SearchTag(next);
	else throw InvalidWrapAllTarget();
}

function * GlobalQueryAll(selector){
	for(const tag of document.querySelectorAll(selector))
		yield Wrap(tag);
}

function * ALL(node){
	yield * node.ls.all;
	yield node;
}

function * FilterClass(target, token){
	for(const node of target)
		if(node.class.contains(token))
			yield node;
}

function * FilterTag(target, name){
	const TagName = String(name).toUpperCase();
	for(const node of target)
		if(node.tagName === TagName)
			yield node;
}

function * FilterVisible(target){
	for(const node of target)
		if(node.checkVisibility())
			yield node;
}

function * MatchAllText(target, pattern){
	for(const node of target)
		if(node.text.match(pattern))
			yield node;
}

function * MatchAllHtml(target, pattern){
	for(const node of target)
		if(node.html.match(pattern))
			yield node;
}

function * MatchAll(target, selector){
	for(const node of target)
		if(node.matches(selector))
			yield node;
}

function * LSLS(target){
	for(const node of target)
		yield * node.ls;
}

function * LSALL(target){
	for(const node of target)
		yield * node.all;
}

function * PrevALL(target){
	while(target = target.prevNode)
		yield target;
}

function * NextALL(target){
	while(target = target.nextNode)
		yield target;
}

function * ParentALL(target){
	while(target = target.parent)
		yield target;
}

function ViewRect({left, top, width, height}){
	return new DOMRect(left + window.scrollX, top + window.scrollY, width, height);
}

function SetOn(target, listeners){
	for(const [eventType, listener] of Object.entries(listeners))
		target.on(eventType, listener);
}

function SetOnce(target, listeners){
	for(const [eventType, listener] of Object.entries(listeners))
		target.once(eventType, listener);
}

function ClearDataSet(dataset){
	for(const name in dataset)
		delete dataset[name];
}

function CompareNodes(a, b){
	return a.text.localeCompare(b.text);
}

function ToInt(value){
	return Math.trunc(value) || 0;
}

function ToIndex(value, length){
	value = ToInt(value);
	if(value < 0) return Math.max(0, value + length);
	if(value > length) return length;
	return value;
}

function * Slice(target, start = 0, end = target.length){
	start = ToIndex(start, target.length);
	end = ToIndex(end, target.length);
	for(; start < end; start ++)
		yield target.at(start);
}

function Splice(target, args){
	const deleted = [];
	if(args.length > 0){
		let [start, deleteCount = Infinity, ... inserted] = args;
		start = ToIndex(start, target.length);
		deleteCount = ToInt(deleteCount);
		while((deleted.length < deleteCount) && (start < target.length)){
			const next = target.at(start);
			deleted.push(next);
			next.remove();
		}
		const next = target.at(start);
		next ? next.before(... inserted) : target.push(... inserted);
	}	return deleted;
}

function OnNodeMutation(mutations){
	for(const mutation of mutations){
		const listener = NodeListeners.get(mutation.target);
		if(listener) listener.call(Node.of(mutation.target), mutation);
	}
}

function ObserveNode(node, options, listener){
	NodeListeners.set(node.tag, listener);
	Observer.observe(node.tag, options);
}

class Node {

	static hasNode(tag){
		return Nodes.has(tag);
	}

	static of(tag){
		return Nodes.get(tag) ?? null;
	}

	static is(node){
		try {
			node.#tag;
			return true;
		} catch {
			return false;
		}
	}

	static tag(node){
		try {
			return node.#tag;
		} catch {
			throw new InvalidNode();
		}
	}

	static query(selector){
		return Wrap(document.querySelector(selector));
	}

	static queryAll(selector){
		return new NodeIterator(GlobalQueryAll(selector));
	}

	static wrap(target){
		const tag = SearchTag(target);
		if(tag) return new this({tag});
	}

	static wrapAll(target){
		const all = [];
		for(const tag of SearchTagAll(target))
			all.push(new this({tag}));
		return NodeIterator.from(all);
	}

	static LS(node){
		return new NodeLS(node.tag);
	}

	static Attrs(node){
		return new AttributeMap(node.tag);
	}

	#tag;
	#ls;
	#attrs;

	constructor({
		document = DefaultDocument,
		name = DefaultTagName,
		tag = document.createElement(name),
		class: classArg,
		style,
		attrs,
		hidden,
		on,
		once,
		text,
		html,
		ls,
	} = {}){
		this.#tag = tag;
		this.#ls = this.constructor.LS(this);
		this.#attrs = this.constructor.Attrs(this);
		Nodes.set(this.tag, this);
		if(classArg)
			this.class = classArg;
		if(attrs)
			this.attrs = attrs;
		if(style)
			this.style = style;
		if(hidden)
			this.hidden = true;
		if(on)
			SetOn(this, on);
		if(once)
			SetOnce(this, once);
		if(ls)
			this.ls = ls;
		else if(text)
			this.text = text;
		else if(html)
			this.html = html;
	}

	get tag(){
		return this.#tag;
	}

	get tagName(){
		return this.tag.tagName;
	}

	get document(){
		return this.tag.ownerDocument;
	}

	get isConnected(){
		return this.tag.isConnected;
	}

	// Events

	on(eventType, listener, options){
		this.tag.addEventListener(eventType, listener, options);
		return this;
	}

	off(eventType, listener, options){
		this.tag.removeEventListener(eventType, listener, options);
		return this;
	}

	once(eventType, listener, options){
		this.on(eventType, listener, {once: true, ... options});
		return this;
	}

	emit(eventType){
		this.dispatch(new Event(eventType));
		return this;
	}

	dispatch(event){
		this.tag.dispatchEvent(event);
		return this;
	}

	observe(options, listener){
		ObserveNode(this, options, listener);
	}

	click(){
		this.tag.click();
	}

	blur(){
		this.tag.blur();
	}

	focus(){
		this.tag.focus();
	}

	scroll(... args){
		this.tag.scroll(... args);
	}

	scrollBy(... args){
		this.tag.scrollBy(... args);
	}

	scrollTo(... args){
		this.tag.scrollTo(... args);
	}

	scrollIntoView(... args){
		this.tag.scrollIntoView(... args);
	}

	animate(... args){
		return this.tag.animate(... args);
	}

	requestFullscreen(){
		return this.tag.requestFullscreen();
	}

	// Display

	get hidden(){
		return this.tag.hidden;
	}

	set hidden(value){
		this.tag.hidden = value;
	}

	show(){
		this.hidden = false;
	}

	hide(){
		this.hidden = true;
	}

	toggleDisplay(){
		if(this.hidden){
			this.show();
			return true;
		} else {
			this.hide();
			return false;
		}
	}

	checkVisibility(options){
		return this.tag.checkVisibility(options);
	}

	// Style

	get style(){
		return this.tag.style;
	}

	set style(style){
		if(IsString(style))
			this.tag.style = style;
		else if(IsObject(style)){
			this.tag.style = '';
			if(IsCSSStyleDeclaration(style)){
				for(const name of style)
					this.style.setProperty(name, style[name]);
			} else {
				for(const [name, value] of Object.entries(style))
					this.style.setProperty(name, value);
			}
		}
	}

	// Class

	get class(){
		return this.tag.classList;
	}

	set class(classList){
		if(IsString(classList))
			this.tag.classList = classList;
		else if(IsIterable(classList)){
			this.tag.classList = '';
			for(const token of classList)
				this.class.add(token);
		}
	}

	// Attributes

	get attrs(){
		return this.#attrs;
	}

	set attrs(attrs){
		this.attrs.replace(attrs);
	}

	get dataset(){
		return this.tag.dataset;
	}

	set dataset(dataset){
		if(IsDOMStringMap(dataset)){
			ClearDataSet(this.dataset);
			for(const name in dataset)
				this.dataset[name] = dataset[name];
		} else if(IsObject(dataset)) {
			ClearDataSet(this.dataset);
			for(const [name, value] of Object.entries(dataset))
				this.dataset[name] = value;
		}
	}

	// Content

	get html(){
		return this.tag.innerHTML;
	}

	set html(html){
		this.tag.innerHTML = html;
	}

	get text(){
		return this.tag.innerText;
	}

	set text(text){
		this.tag.innerText = text;
	}

	// Geometry

	// View Rect
	get vp(){
		return this.tag.getBoundingClientRect();
	}

	// Page Rect
	get abs(){
		return ViewRect(this.vp);
	}

	// Offset Rect
	get rel(){
		return new OffsetRect(this.tag);
	}

	// Client Rect
	get box(){
		return new ClientRect(this.tag);
	}

	// Scroll Geometry
	get scr(){
		return new ScrollGeometry(this.tag);
	}

	// DOM

	get parent(){
		return Wrap(this.tag.parentElement);
	}

	get prevNode(){
		return Wrap(this.tag.previousElementSibling);
	}

	get nextNode(){
		return Wrap(this.tag.nextElementSibling);
	}

	set parent(node){
		IsNull(node) ? this.remove() : Unwrap(node).append(this.tag);
	}

	set prevNode(node){
		this.before(node);
	}

	set nextNode(node){
		this.after(node);
	}

	get parentAll(){
		return new NodeIterator(ParentALL(this));
	}

	get prevAll(){
		return new NodeIterator(PrevALL(this));
	}

	get nextAll(){
		return new NodeIterator(NextALL(this));
	}

	get ls(){
		return this.#ls;
	}

	get all(){
		return new NodeIterator(ALL(this));
	}

	set ls(ls){
		if(IsIterable(ls))
			this.ls.replace(... ls);
		else
			this.ls.replace(ls);
	}

	isEqual(node){
		return this.tag.isEqualNode(TryUnwrap(node));
	}

	isSame(node){
		return this.tag.isSameNode(TryUnwrap(node));
	}

	contains(node){
		return this.tag.contains(TryUnwrap(node));
	}

	append(... nodes){
		this.tag.append(... nodes.map(Unwrap));
	}

	prepend(... nodes){
		this.tag.prepend(... nodes.map(Unwrap));
	}

	before(... nodes){
		this.tag.before(... nodes.map(Unwrap));
	}

	after(... nodes){
		this.tag.after(... nodes.map(Unwrap));
	}

	add(config){
		const node = new Node(config);
		this.append(node);
		return node;
	}

	remove(){
		this.tag.remove();
	}

	replace(... args){
		return this.tag.replaceWith(... args.map(Unwrap));
	}

	// CSS

	matches(selector){
		return this.tag.matches(selector);
	}

	closest(selector){
		return Wrap(this.tag.closest(selector));
	}
}

class NodeGenerator {

	* for(){
		// node generator
	}

	[Symbol.iterator](){
		return this.for();
	}

	// Iterator

	take(limit){
		return new NodeIterator(Take(this.for(), limit));
	}

	drop(limit){
		return new NodeIterator(Drop(this.for(), limit));
	}

	filter(cb){
		return new NodeIterator(Filter(this.for(), cb));
	}

	every(cb){
		let index = 0;
		for(const node of this)
			if(!cb(node, index ++))
				return false;
		return true;
	}

	some(cb){
		let index = 0;
		for(const node of this)
			if(cb(node, index ++))
				return true;
		return false;
	}

	reduce(cb, ... args){
		return Reduce(this.for(), cb, ... args);
	}

	find(cb){
		let index = 0;
		for(const node of this)
			if(cb(node, index ++))
				return node;
		return null;
	}

	* map(cb){
		let index = 0;
		for(const node of this)
			yield cb(node, index ++);
	}

	* flatMap(cb){
		let index = 0;
		for(const node of this)
			yield * cb(node, index ++);
	}

	forEach(cb){
		let index = 0;
		for(const node of this)
			cb(node, index ++);
	}

	toArray(){
		return [... this.for()]
	}

	count(){
		let count = 0;
		for(const node of this)
			count ++;
		return count;
	}

	depth(){
		let depth = 0;
		for(const node of this)
			depth = Math.max(depth, node.ls.depth() + 1);
		return depth;
	}

	// Events

	on(eventType, listener, options){
		for(const node of this)
			node.on(eventType, listener, options);
	}

	off(eventType, listener, options){
		for(const node of this)
			node.off(eventType, listener, options);
	}

	once(eventType, listener, options){
		for(const node of this)
			node.once(eventType, listener, options);
	}

	emit(eventType){
		for(const node of this)
			node.emit(eventType);
	}

	// Display

	show(){
		for(const node of this)
			node.show();
	}

	hide(){
		for(const node of this)
			node.hide();
	}

	toggleDisplay(){
		for(const node of this)
			node.toggleDisplay();
	}

	// Style

	css(name, value){
		for(const node of this)
			node.style.setProperty(name, value);
	}

	removeCSS(name){
		for(const node of this)
			node.style.removeProperty(name);
	}

	clearCSS(){
		for(const node of this)
			node.style = '';
	}

	// Class

	addClass(... args){
		for(const node of this)
			node.class.add(... args);
	}

	removeClass(... args){
		for(const node of this)
			node.class.remove(... args);
	}

	toggleClass(token, force){
		for(const node of this)
			node.class.toggle(token, force);
	}

	replaceClass(oldToken, newToken){
		for(const node of this)
			node.class.replace(oldToken, newToken);
	}

	clearClasses(){
		for(const node of this)
			node.class = '';
	}

	* classes(){
		for(const node of this)
			yield * node.class;
	}

	// Attrs

	attr(name, value){
		for(const node of this)
			node.attrs.set(name, value);
	}

	removeAttr(name){
		for(const node of this)
			node.attrs.remove(name);
	}

	toggleAttr(name, force){
		for(const node of this)
			node.attrs.toggle(name, force);
	}

	clearAttrs(){
		for(const node of this)
			node.attrs.clear();
	}

	// Content

	text(text){
		if(IsFunction(text))
			for(const node of this)
				node.text = text(node.text);
		else
			for(const node of this)
				node.text = text;
	}

	html(html){
		if(IsFunction(html))
			for(const node of this)
				node.html = html(node.html);
		else
			for(const node of this)
				node.html = html;
	}

	* texts(){
		for(const node of this)
			yield node.text;
	}

	* htmls(){
		for(const node of this)
			yield node.html;
	}

	// DOM

	add(config){
		for(const node of this)
			node.add(config);
	}

	remove(){
		for(const node of this.toArray())
			node.remove();
	}

	includes(value){
		if(Node.is(value)){
			for(const node of this)
				if(node === value)
					return true;
		}	return false;
	}

	contains(value){
		if(Node.is(value)){
			for(const node of this)
				if(node.contains(value))
					return true;
		}	return false;
	}

	indexOf(node){
		let index = 0;
		for(const next of this){
			if(next === node)
				return index;
			index ++;
		}	return -1;
	}

	get ls(){
		return new NodeIterator(LSLS(this));
	}

	get all(){
		return new NodeIterator(LSALL(this));
	}

	// Filters

	matchAll(selector){
		return new NodeIterator(MatchAll(this, selector));
	}

	match(selector){
		for(const node of this)
			if(node.matches(selector))
				return node;
		return null;
	}

	matchText(pattern){
		return WrapIterator(MatchAllText(this, pattern));
	}

	matchHTML(pattern){
		return WrapIterator(MatchAllHtml(this, pattern));
	}

	filterClass(token){
		return new NodeIterator(FilterClass(this, token));
	}

	filterTag(name){
		return new NodeIterator(FilterTag(this, name));
	}

	filterVisible(){
		return new NodeIterator(FilterVisible(this));
	}
}

class NodeIterator extends NodeGenerator {

	static from(iterable){
		return new NodeIterator(iterable);
	}

	static of(... args){
		return this.from(args);
	}

	static wrap(tags){
		return WrapIterator(tags);
	}

	#target;

	constructor(iterator){
		super();
		this.#target = iterator;
	}

	* for(){
		yield * this.#target;
	}
}

class NodeLS extends NodeGenerator {

	#tag;

	constructor(tag){
		super();
		this.#tag = tag;
	}

	get tag(){
		return this.#tag;
	}

	for(){
		return WrapAll(this.tag.children);
	}

	get length(){
		return this.tag.childElementCount;
	}

	get first(){
		return Wrap(this.tag.firstElementChild);
	}

	get last(){
		return Wrap(this.tag.lastElementChild);
	}

	set first(node){
		this.unshift(node);
	}

	set last(node){
		this.push(node);
	}

	at(offset){
		return Wrap(this.tag.children[offset]);
	}

	includes(node){
		try {
			return Node.tag(node).parentNode === this.tag;
		} catch {
			return false;
		}
	}

	replace(... args){
		this.tag.replaceChildren(... args.map(Unwrap));
	}

	clear(){
		this.replace();
	}

	remove(){
		this.clear();
	}

	slice(start, end){
		return new NodeIterator(Slice(this, start, end));
	}

	splice(... args){
		return NodeIterator.from(Splice(this, args));
	}

	shift(){
		const first = this.first;
		if(first){
			first.remove();
			return first;
		}	return null;
	}

	pop(){
		const last = this.last;
		if(last){
			last.remove();
			return last;
		}	return null;
	}

	push(... args){
		this.tag.append(... args.map(Unwrap));
		return args.length
	}

	unshift(... args){
		this.tag.prepend(... args.map(Unwrap));
		return args.length
	}

	// Sorting

	sort(cb = CompareNodes){
		this.push(... this.toArray().sort(cb));
		return this;
	}

	reverse(){
		const last = this.first;
		while(this.last !== last)
			last.before(this.last);
		return this;
	}

	shuffle(){
		this.sort(() => Math.random() - 0.5);
		return this;
	}

	// Filters

	query(selector){
		return Wrap(this.tag.querySelector(selector));
	}

	queryAll(selector){
		return WrapIterator(this.tag.querySelectorAll(selector));
	}

	filterClass(token){
		return WrapIterator(this.tag.getElementsByClassName(token));
	}

	filterTag(name){
		return WrapIterator(this.tag.getElementsByTagName(name));
	}
}

class AttributeMap {

	#tag;

	constructor(tag){
		this.#tag = tag;
	}

	get tag(){
		return this.#tag;
	}

	get length(){
		return this.tag.attributes.length;
	}

	at(offset){
		return this.tag.attributes[offset];
	}

	has(name){
		return this.tag.hasAttribute(name);
	}

	get(name){
		return this.tag.getAttribute(name);
	}

	set(name, value){
		return this.tag.setAttribute(name, value);
	}

	remove(name){
		return this.tag.removeAttribute(name);
	}

	toggle(name, force){
		return this.tag.toggleAttribute(name, force);
	}

	clear(){
	  while (this.length > 0)
	    this.remove(this.at(0).name);
	}

	* [Symbol.iterator](){
		yield * this.tag.attributes;
	}

	replace(attrs){
		this.clear();
		if(IsAttributeMap(attrs)){
			for(const attr of attrs)
				this.set(attr.name, attr.value);
		} else {
			for(const [name, value] of Object.entries(attrs))
				this.set(name, value);
		}
	}
}

class Rect {

	#tag;

	constructor(tag){
		this.#tag = tag;
	}

	get tag(){
		return this.#tag;
	}

	get x(){
		return this.left;
	}

	get y(){
		return this.top;
	}

	get left(){
		return 0;
	}

	get right(){
		return this.left + this.width;
	}

	get top(){
		return 0;
	}

	get bottom(){
		return this.top + this.height;
	}

	get width(){
		return 0;
	}

	get height(){
		return 0;
	}
}

class ScrollGeometry {

	#tag;

	constructor(tag){
		this.#tag = tag;
	}

	get tag(){
		return this.#tag;
	}

	set x(value){
		this.tag.scrollLeft = value;
	}

	set y(value){
		this.tag.scrollTop = value;
	}

	set left(value){
		this.tag.scrollLeft = value;
	}

	set top(value){
		this.tag.scrollTop = value;
	}

	get x(){
		return this.tag.scrollLeft;
	}

	get y(){
		return this.tag.scrollTop;
	}

	get left(){
		return this.tag.scrollLeft;
	}

	get top(){
		return this.tag.scrollTop;
	}

	get width(){
		return this.tag.scrollWidth;
	}

	get height(){
		return this.tag.scrollHeight;
	}

	get hmax(){
		return this.width - this.tag.clientWidth;
	}

	get vmax(){
		return this.height - this.tag.clientHeight
	}

	get tx(){
		return this.x / this.hmax;
	}

	get ty(){
		return this.y / this.vmax;
	}

	set tx(value){
		this.x = value * this.hmax;
	}

	set ty(value){
		this.y = value * this.vmax;
	}

	to(... args){
		this.tag.scrollTo(... args);
	}

	by(... args){
		this.tag.scrollBy(... args);
	}

	intoView(... args){
		this.tag.scrollIntoView(... args);
	}
}

class ClientRect extends Rect {

	get left(){
		return this.tag.clientLeft;
	}

	get top(){
		return this.tag.clientTop;
	}

	get width(){
		return this.tag.clientWidth;
	}

	get height(){
		return this.tag.clientHeight;
	}
}

class OffsetRect extends Rect {

	get parent(){
		return Wrap(this.tag.offsetParent);
	}

	get left(){
		return this.tag.offsetLeft;
	}

	get top(){
		return this.tag.offsetTop;
	}

	get width(){
		return this.tag.offsetWidth;
	}

	get height(){
		return this.tag.offsetHeight;
	}
}
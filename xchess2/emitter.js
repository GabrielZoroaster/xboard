
export {Emitter}

class Emitter {

	#listeners = Object.create(null);
	#onceListeners = Object.create(null);
	#subscribers = new Set();

	on(type, listener){
		(this.#listeners[type] ||= new Set()).add(listener);
		return this;
	}

	once(type, listener){
		(this.#onceListeners[type] ||= new Set()).add(listener);
		return this;
	}

	off(type, listener){
		this.#listeners[type]?.delete(listener);
		this.#onceListeners[type]?.delete(listener);
		return this;
	}

	emit(type, ... args) {
		for (const listener of this.#listeners[type] || [])
			listener(... args);
		const onceListeners = this.#onceListeners[type];
		if(onceListeners){
			for (const listener of onceListeners)
			  listener(... args);
			delete this.#onceListeners[type];
		}
		for(const subscriber of this.#subscribers)
			subscriber.emit(type, ... args);
	}

	subscribe(subscriber){
		this.#subscribers.add(subscriber);
	}

	unsubscribe(subscriber){
		this.#subscribers.delete(subscriber);
	}
}
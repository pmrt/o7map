class EventEmitter {
  constructor() {
    this._listeners = {}
  }

  on(evtName, handler) {
    if (!this._listeners[evtName]) {
      this._listeners[evtName] = [];
    }

    this._listeners[evtName].push(handler);
  }

  off(evtName, handler) {
    if (!evtName) {
      this._listeners = {};
      return this;
    }

    if (!handler) {
      this._listeners[evtName] = [];
      return this;
    }

    const callbacks = this._listeners[evtName];
    if (!Array.isArray(callbacks)) {
      return this;
    }

    this._listeners[evtName].splice(
      callbacks.indexOf(handler, 1)
    );
  }

  emit(evtName, evtData) {
    const callbacks = this._listeners[evtName];
    if (!Array.isArray(callbacks)) {
      return this;
    }

    for (let i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].call(this, evtData);
    }

    return this;
  }
}

export default EventEmitter;
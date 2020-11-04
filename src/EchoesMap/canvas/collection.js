import { fabric } from "fabric";

class MapCollection {
  constructor() {
    this._group = null;
    this._eventQueue = [];

    if (!this.MapDataClass || !this.MapTypeClass) {
      throw new TypeError("Collection class has abstract properties which have not been implemented. Collection needs to be called from a class extending it and this class must implement getters for MapDataClass and MapTypeClass");
    }
  }

  get group() {
    return this._group;
  }

  // to be implemented by childs
  get MapDataClass() {
    return null;
  }

  // to be implemented by childs
  get MapTypeClass() {
    return null;
  }

  /*
   on adds a new event listener to the underlying event queue, which will
   be flushed after rendering. If a objType is provided, the event listener
   will be added to the underlying objects inside the group matching the type
   e.g.: 'rect', 'textbox'
  */
  on(eventName, handler, objType) {
    this._eventQueue.push({
      eventName, handler, objType
    })

    return this;
  }


  _addEventListener(eventName, handler) {
    this._group.on(eventName, handler);

    return this;
  }

  _addObjsEventListener(eventName, handler, objType) {
    const objs = this._group.getObjects(objType);
    objs.forEach(obj => {
      obj.on(eventName, handler);
    })

    return this;
  }

  _flushEvents() {
    if (!this._group) {
      return;
    }

    const queue = this._eventQueue;
    for (let event of queue) {
      const { eventName, handler, objType } = event;

      if (objType) {
        this._addObjsEventListener(eventName, handler, objType);
      } else {
        this._addEventListener(eventName, handler);
      }
    }

    // never clear the eventQueue to remember events
    // between renders.
    return this;
  }

  clear() {
    if (this._group) {
      const objs = this._group.getObjects();
      objs.forEach(obj => {
        obj.off();
      })
      this._group.off();
      this._group.destroy();
      this._group = null;
    }

    return this;
  }

  bringToFront() {
    this._group.bringToFront();

    return this;
  }

  center() {
    this._group.center();

    return this;
  }

  updateFontSize(fontSize) {
    const objs = this._group.getObjects("textbox");
    objs.forEach(obj => {
      obj.set({ fontSize })
    })

    return this;
  }

  render(maps) {
    let mapObjects = [];
    let errors = [];

    for (let data of maps) {
      const d = new this.MapDataClass(data);
      const map = new this.MapTypeClass(d);
      const ok = map.render();
      if (ok) {
        mapObjects.push(...map.fabricObjs);
      } else {
        errors.push({
          message: `WARN: Skipping map '${map.name}'`,
          type: "warn"
        })
      }
    }

    this._group = new fabric.Group(mapObjects, {
      selectable: false,
      hasControls: false,
      subTargetCheck: true,
    });
    this._flushEvents();

    return {
      errors,
    }
  }
}

export default MapCollection;
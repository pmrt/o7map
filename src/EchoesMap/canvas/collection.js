import { fabric } from "fabric";

class MapCollection {
  constructor(canvas, db, opts) {
    this._canvas = canvas;
    this._db = db;
    this._group = null;
    this._eventQueue = [];
    this._objsWithEvents = [];
    this._reportObjs = [];
    this.opts = opts;

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

  addReportObj(obj) {
    this._reportObjs.push(obj);

    return this;
  }

  // clearReportObjs remove rendered elements from canvas and clear the cache.
  // canvas.requestRenderAll may be needed after this.
  clearReportObjs() {
    for (let obj of this._reportObjs) {
      this._group.remove(obj)
      this._canvas.remove(obj)
    }
    this._reportObjs.length = 0;

    return this;
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
    for (let i = 0, len = objs.length; i < len; i++) {
      const obj = objs[i];
      obj.on(eventName, handler);
      this._objsWithEvents.push(obj);
    }

    return this;
  }

  _flushEvents() {
    if (!this._group) {
      return;
    }

    // Ensure we drop all old events before flushing new ones, just in case
    // clear() isn't called for some reason. This will help avoiding
    // memory leak issues
    this._objsWithEvents.length = 0;
    this._group.off();

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


  findRendered(id) {
    const rects = this._group.getObjects("rect");
    for (let i = 0, len = rects.length; i < len; i++) {
      const rect = rects[i];
      const obj = rect.get("metadata").data;
      if (obj.ID === id) {
        return obj;
      }
    }
  }

  clear() {
    if (this._group) {
      const objs = this._objsWithEvents;
      for (let obj of objs) {
        obj.off();
      }
      this._objsWithEvents.length = 0;
      this._group.off();
      this._group.destroy();
      this._group = null;
      this.clearReportObjs();
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
      const c = obj.get("metadata").data;
      c.updateFontSize(fontSize);
    })

    return this;
  }

  updateRectSize(size) {
    const objs = this._group.getObjects("rect");
    objs.forEach(obj => {
      obj.set({ width: size, height: size });
    })

    return this;
  }

  async findBy(type, index, exp) {
    const res = await this._db[type]
      .where(index)
      .equals(exp)
      .limit(1)
      .toArray();

    if (!res || res.length === 0) {
      return;
    }

    return res[0];
  }

  afterRender() {
    for (let i = 0, len = this._rects.length; i < len; i++) {
      const rect = this._rects[i];
      rect.bringToFront()
    }

    // free cached rects
    this._rects = null;

    return this;
  }

  render(all) {
    let mapObjects = [];
    let errors = [];

    this._rects = [];
    for (let data of all) {
      const d = new this.MapDataClass(data);
      const map = new this.MapTypeClass(d, this._canvas, this._db, this.opts);
      const ok = map.render();
      if (ok) {
        mapObjects.push(...map.fabricObjs);
        this._rects.push(map._rect);
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
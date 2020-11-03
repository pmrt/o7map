import { fabric } from "fabric";
import { wrapText } from "../helpers";
import theme from "./theme";

import { FONTSIZE } from "./consts";

export class RegionData {
  constructor(regionData) {
    const {
      mapID, mapName, scale, ee_gates, avgSec, maxSec, minSec, x1, y1, systems
    } = regionData;

    this._id = mapID;
    this._name = mapName;
    this._scale = scale;
    this._gates = ee_gates;
    this._sec = {
      avg: avgSec,
      max: maxSec,
      min: minSec,
    };
    this._coords = {
      x: x1,
      y: y1,
    }
    this._systems = systems;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get scale() {
    return this._scale;
  }

  get gates() {
    return this._gates;
  }

  get sec() {
    return this._sec;
  }

  get coords() {
    return this._coords;
  }

  get systems() {
    return this._systems;
  }
}

class Region {
  constructor(regionData) {
    this._regionData = regionData;
    this._objs = [];
  }

  get canvas() {
    return this._canvas;
  }

  get coords() {
    return this._regionData.coords;
  }

  get systems() {
    return this._regionData.systems;
  }

  get name() {
    return this._regionData.name;
  }

  get fabricObjs() {
    return this._objs;
  }

  render() {
    if (this.coords.x === null || this.coords.y === null) {
      return null;
    }

    if (this.coords.x === undefined || this.coords.y === undefined) {
      return null;
    }

    if (Number.isNaN(this.coords.x) || Number.isNaN(this.coords.y)) {
      return null;
    }

    const regionRect = new fabric.Rect({
      left: this.coords.x,
      top: this.coords.y,
      fill: theme.secondary,
      width: 10,
      height: 10,
      angle: 45,
      selectable: true,
      hasControls: true,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      metadata: {
        name: this.name,
        coords: this.coords,
        systems: this.systems,
      },
    });

    const nameTextbox = new fabric.Textbox(wrapText(this.name, 20), {
      width: 50,
      fontSize: FONTSIZE,
      fontFamily: "Roboto Mono",
      fill: theme.primary,
      textAlign: "center",
    })

    nameTextbox.set({
      left: this.coords.x - nameTextbox.getScaledWidth() / 2,
      top: this.coords.y + regionRect.getScaledWidth() / 2 + 8,
    })

    this._objs.push(
      regionRect, nameTextbox,
    );

    return true;
  }
}

export class RegionCollection {
  constructor() {
    this._group = null;
    this._eventQueue = [];
  }

  get group() {
    return this._group;
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
    let regions = [];
    let errors = [];

    for (let data of maps) {
      const rd = new RegionData(data);
      const region = new Region(rd);
      const ok = region.render();
      if (ok) {
        regions.push(...region.fabricObjs);
      } else {
        errors.push({
          message: `WARN: Skipping region '${region.name}'`,
          type: "warn"
        })
      }
    }

    this._group = new fabric.Group(regions, {
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

export default Region;
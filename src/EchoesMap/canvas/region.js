import { fabric } from "fabric";
import theme from "./theme";

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
  constructor(canvas, regionData) {
    if (!canvas) {
      throw new Error("Map: failed to create region. Missing canvas object");
    }

    this._canvas = canvas;
    this._regionData = regionData;
    this._obj = null;
    this._firstRender = true;
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

  get fabricObj() {
    return this._obj;
  }

  update() {
    this._obj.set({
      left: this.coords.x,
      top: this.coords.y,
      fill: theme.secondary,
      width: 10,
      height: 10,
      angle: 45,
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      metadata: this.data,
    });
  }

  render() {
    if (this._firstRender) {
      this._obj = new fabric.Rect();
      this.update();
      this._firstRender = false;
    } else {
      this.update();
    }
  }
}

export default Region;
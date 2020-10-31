import { fabric } from "fabric";
import { wrapText } from "../helpers";
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
    this._objs = [];
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

  get name() {
    return this._regionData.name;
  }

  get fabricObjs() {
    return this._objs;
  }

  update() {
    const [region, text] = this.fabricObjs;
    region.set({
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

    text.set({
      left: this.coords.x - text.getScaledWidth() / 2,
      top: this.coords.y + region.getScaledWidth() / 2 + 8,
      fontFamily: "Roboto Mono",
      fill: theme.primary,
      fontSize: "8",
      textAlign: "center",
    })
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

    if (this._firstRender) {
      this._objs.push(
        new fabric.Rect(),
        new fabric.Textbox(wrapText(this.name, 20), {
          width: 50,
          fontSize: "8",
        })
      );
      this.update();
      this._firstRender = false;
    } else {
      this.update();
    }

    return true;
  }
}

export default Region;
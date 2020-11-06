import { fabric } from "fabric";
import { getSecColor, wrapText } from "../helpers";
import theme from "./theme";

import MapCollection from "./collection";

export class RegionData {
  constructor(regionData) {
    const {
      mapID, mapName, ee_gates, avgSec, maxSec, minSec, x1, y1, systems
    } = regionData;

    this.ID = mapID;
    this.name = mapName;
    this.gates = ee_gates;
    this.sec = {
      avg: avgSec,
      max: maxSec,
      min: minSec,
    };
    this.coords = {
      x: x1,
      y: y1,
    }
    this.systems = systems;
  }
}

export class Region {
  constructor(regionData, opts) {
    this._regionData = regionData;
    this._objs = [];
    this.opts = opts;
  }

  get ID() {
    return this._regionData.ID;
  }

  get sec() {
    return this._regionData.sec;
  }

  get avgSec() {
    if (!this._regionData.sec && !this._regionData.sec.avg) {
      return null;
    }

    let sec = this._regionData.sec.avg.toFixed(1);
    if (sec === "0.0") {
      sec = "-0.0";
    }
    return sec;
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

    const color = getSecColor(this.avgSec);

    const regionRect = new fabric.Rect({
      left: this.coords.x,
      top: this.coords.y,
      fill: color || theme.secondary,
      width: 10,
      height: 10,
      angle: 45,
      selectable: true,
      hasControls: true,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      metadata: {
        data: this,
      },
    });

    const nameTextbox = new fabric.Textbox(wrapText(this.name, 20), {
      width: 50,
      fontSize: this.opts.fontSize,
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

export class RegionCollection extends MapCollection {
  get MapDataClass() {
    return RegionData;
  }

  get MapTypeClass() {
    return Region;
  }
}

export default RegionCollection;
import { fabric } from "fabric";
import { getSecColor, wrapText } from "../helpers";
import theme from "./theme";

import MapCollection from "./collection";

class SystemData {
  constructor(sysData, all) {
    const {
      sid, sn, cid, cn, rn, sec, x1, y2
    } = sysData;

    this.ID = sid;
    this.name = sn;
    this.constellationName = cn;
    this.constellationID = cid;
    this.regionName = rn;
    this.sec = sec;
    this.coords = {
      x: x1,
      y: y2,
    }
    this.near = all;
  }
}

class System {
  constructor(systemData, opts) {
    this._systemData = systemData;
    this._objs = [];
    this._gates = null;
    this._fullName = this._systemData.sec
      ? `${this._systemData.name} ${this.sec}`
      : this._systemData.name;
    this.opts = opts;
  }

  get ID() {
    return this._systemData.ID;
  }

  get coords() {
    return this._systemData.coords;
  }

  get sec() {
    if (!this._systemData.sec) {
      return null;
    }

    let sec = this._systemData.sec.toFixed(1);
    if (sec === "0.0") {
      sec = "-0.0";
    }
    return sec;
  }

  get name() {
    return this._fullName;
  }

  hasName() {
    return !!this._systemData.name;
  }

  hasRegion() {
    return !!this._systemData.regionName;
  }

  get constellationName() {
    return this._systemData.constellationName;
  }

  get constellationID() {
    return this._systemData.constellationID;
  }

  get regionName() {
    return this._systemData.regionName;
  }

  get near() {
    return this._systemData.near;
  }

  get fabricObjs() {
    return this._objs;
  }

  findGates() {
    if (Array.isArray(this._gates)) {
      return this._gates;
    }

    let gates = [];
    for (let system of this.near) {
      const edges = system.ee_links;
      if (!edges) {
        continue;
      }

      const edgeID = parseInt(this.ID.toString().substr(-4));
      if (edges.indexOf(edgeID) >= 0) {
        gates.push({
          x2: system.x1,
          y2: system.y1,
          x1: this.coords.x,
          y1: this.coords.y,
          sameRegion: system.rn === this.regionName,
        })
      }
    }

    this._gates = gates;
    return gates;
  }

  render() {
    if (this.coords.x === null || this.coords.y === null) {
      return null;
    }

    if (!this.hasName() || !this.hasRegion()) {
      return null;
    }

    if (this.coords.x === undefined || this.coords.y === undefined) {
      return null;
    }

    if (Number.isNaN(this.coords.x) || Number.isNaN(this.coords.y)) {
      return null;
    }

    const gates = this.findGates();

    const color = getSecColor(this.sec);

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
        name: this.name,
        coords: this.coords,
        sec: this.sec,
        constellationID: this.constellationID,
        constellationName: this.constellationName,
        regionName: this.regionName,
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

    for (let gate of gates) {
      const { x2, y2, x1, y1, sameRegion } = gate;

      const defaultOpts = {
        strokeWidth: this.opts.linkWidth,
        selectable: false,
      }

      const opts = sameRegion
        ? {
          ...defaultOpts,
          stroke: color || theme.primary,
        }
        : {
          ...defaultOpts,
          stroke: theme.lightGrey,
          strokeDashArray: [3, 3],
        }

      const line = new fabric.Line([x2, y2, x1, y1], opts);
      this._objs.push(
        line,
      )
    }

    return true;
  }
}

export class SystemCollection extends MapCollection {
  get MapDataClass() {
    return SystemData;
  }

  get MapTypeClass() {
    return System;
  }

  getLinks() {
    return this._group.getObjects("line");
  }
}

export default SystemCollection;
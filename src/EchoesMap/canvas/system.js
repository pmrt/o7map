import { fabric } from "fabric";
import { wrapText } from "../helpers";
import theme from "./theme";

import { FONTSIZE, LINK_WIDTH } from "./consts";
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
  constructor(systemData) {
    this._systemData = systemData;
    this._objs = [];
    this._gates = null;
  }

  get ID() {
    return this._systemData.ID;
  }

  get coords() {
    return this._systemData.coords;
  }

  get name() {
    return this._systemData.name;
  }

  get sec() {
    return this._systemData.sec;
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

    if (!this.name) {
      return null;
    }

    if (this.coords.x === undefined || this.coords.y === undefined) {
      return null;
    }

    if (Number.isNaN(this.coords.x) || Number.isNaN(this.coords.y)) {
      return null;
    }

    const gates = this.findGates();

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
        sec: this.sec,
        constellationID: this.constellationID,
        constellationName: this.constellationName,
        regionName: this.regionName,
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

    for (let gate of gates) {
      const { x2, y2, x1, y1, sameRegion } = gate;

      const defaultOpts = {
        strokeWidth: LINK_WIDTH,
        selectable: false,
      }

      const opts = sameRegion
        ? {
          ...defaultOpts,
          stroke: theme.primary,
        }
        : {
          ...defaultOpts,
          stroke: theme.lightGrey,
          strokeDashArray: [4, 4],
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
}

export default SystemCollection;
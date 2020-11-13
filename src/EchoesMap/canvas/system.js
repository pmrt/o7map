import { fabric } from "fabric";
import { getSecColor, wrapText } from "../helpers";
import theme from "./theme";

import MapCollection from "./collection";

export class SystemData {
  constructor(sysData) {
    const {
      id, n, sec, x, y, rg, st, pl, cn, ed,
    } = sysData;

    this.ID = id;
    this.name = n;
    this.constellation = {
      id: cn.id,
      name: cn.n,
    };
    this.region = {
      id: rg.id,
      name: rg.name,
    };
    this.sec = sec;
    this.stations = st;
    this.planets = pl;
    this.edges = ed || [];
    this.coords = { x, y};
  }
}

export class System {
  constructor(sysData, canvas, db, opts) {
    this._systemData = sysData;
    this._canvas = canvas;
    this._db = db;
    this._objs = [];
    this._rect = null;
    this._gates = [];
    this._fullName = this._systemData.sec
      ? `${this._systemData.name} ${this.sec.str}`
      : this._systemData.name;
    this.opts = opts;
  }

  get ID() {
    return this._systemData.ID;
  }

  get rawName() {
    return this._systemData.name;
  }

  get name() {
    return this._fullName;
  }

  get sec() {
    return this._systemData.sec || {
      sec: null,
      str: null,
    };
  }

  get coords() {
    return this._systemData.coords;
  }

  get constellation() {
    return this._systemData.constellation;
  }

  get region() {
    return this._systemData.region;
  }

  get edges() {
    return this._systemData.edges;
  }

  get fabricObjs() {
    return this._objs;
  }

  /*
    calcCoords tries to compute the absolute coordinates. Since rects are
    part of a group and centered this is useful for getting actual system
    coords.

    If group, x and y are provided it'll use these properties for the
    calculation. If the system is rendered, call this function without
    params.
  */
  calcCoords(otherGroup, x, y) {
    let rect, group;

    if (otherGroup) {
      rect = { left: x, top: y };
      group = otherGroup;
    } else {
      rect = this._rect;
      group = rect.group;
    }

    if (!rect) {
      return;
    }

    return {
      x: rect.left + group.left + group.width/2,
      y: rect.top + group.top + group.height/2,
    }
  }

  clicked(duration = 150) {
    const { x, y } = this.calcCoords();

    return new Promise(resolve => {
        const pulse = new fabric.Circle({
            left: x,
            top: y,
            fill: theme.secondary,
            strokeWidth: 10,
            radius: 5,
            selectable: false,
            hasControls: false,
            hasBorders: false,
            opacity: 1,
            originX: "center",
            originY: "center",
          })

          this._canvas.add(pulse);
          this._canvas.sendToBack(pulse);

          pulse.animate({
            radius: 20,
            opacity: 0,
          }, {
            onChange: this._canvas.renderAll.bind(this._canvas),
            duration,
            onComplete: () => {
              this._canvas.remove(pulse);
              this._canvas.renderAll();
              resolve();
            }
          })
      }
    )
  }

  render() {
    const color = getSecColor(this.sec.str) || theme.secondary;

    const regionRect = new fabric.Rect({
      left: this.coords.x,
      top: this.coords.y,
      fill: color,
      width: 10,
      height: 10,
      angle: 45,
      strokeWidth: 40,
      transparentCorners: false,
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      metadata: {
        data: this,
      },
    });
    this._rect = regionRect;

    const nameTextbox = new fabric.Textbox(wrapText(this.name, 20), {
      width: 50,
      fontSize: this.opts.fontSize,
      fontFamily: "Roboto Mono",
      fill: theme.primary,
      textAlign: "center",
    })

    nameTextbox.set({
      left: this.coords.x - nameTextbox.getScaledWidth() / 2,
      top: this.coords.y + regionRect.getScaledWidth() / 2 - 12,
    })

    for (let gate of this.edges) {
      const { x, y, sr: sameRegion } = gate;

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

      const line = new fabric.Line([x, y, this.coords.x, this.coords.y], opts);
      this._objs.push(
        line,
      )
    }

    this._objs.push(
      regionRect, nameTextbox,
    );

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

  findRenderedSystem(name) {
    const rects = this._group.getObjects("rect");
    for (let i = 0, len = rects.length; i < len; i++) {
      const rect = rects[i];
      const system = rect.get("metadata").data;
      if (system.rawName === name) {
        return system;
      }
    }
  }

  async findStartingWith(exp) {
    return await this._db.systems
      .where("n")
      .startsWithIgnoreCase(exp)
      .toArray();
  }

  async findSystemByName(name) {
    const sysData = await this.findBy("systems", "n", name);
    if (sysData) {
      const sd = new SystemData(sysData);
      return new System(sd, this._canvas, this._db, this.opts);
    }
    return;
  }
}

export default SystemCollection;
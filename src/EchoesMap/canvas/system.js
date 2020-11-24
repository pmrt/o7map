import { fabric } from "fabric";
import { getSecColor, lerp, lerpColor, wrapText } from "../helpers";
import { REPORT_SYSTEM_MIN_RADIUS, REPORT_SYSTEM_MAX_RADIUS, TEXT_PADDING, MIN_TEXT_PADDING } from "./consts";
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
      name: rg.n,
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

  get stations() {
    return this._systemData.stations;
  }

  get planets() {
    return this._systemData.planets;
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

    if (!rect || !group) {
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

  updateFontSize(fontSize) {
    if (fontSize === 0) {
      this._text.set({
        opacity: 0,
      })
      return;
    }

    const top = this._rect.top + this._rect.getScaledHeight()/2 - this._rect.strokeWidth/2;
    let padding = this._canvas.getZoom() * 0.8;
    padding = Math.min(padding, TEXT_PADDING);
    padding = Math.max(padding, MIN_TEXT_PADDING);
    this._text.set({
      opacity: 1,
      top: top + padding,
      fontSize,
    })
  }

  render() {
    const color = getSecColor(this.sec.str) || theme.secondary;

    const sysRect = new fabric.Rect({
      left: this.coords.x,
      top: this.coords.y,
      fill: color,
      width: this.opts.rectSize,
      height: this.opts.rectSize,
      angle: 45,
      strokeWidth: 10,
      transparentCorners: false,
      selectable: false,
      hasControls: false,
      hoverCursor: 'pointer',
      originX: 'center',
      originY: 'center',
      metadata: {
        data: this,
      },
    });
    this._rect = sysRect;

    const nameTextbox = this._text = new fabric.Textbox(wrapText(this.name, 20), {
      width: 50,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      fontSize: this.opts.fontSize,
      fontFamily: "Roboto Mono",
      fill: theme.primary,
      textAlign: "center",
      metadata: {
        data: this,
      }
    })

    nameTextbox.set({
      left: this.coords.x - nameTextbox.getScaledWidth() / 2,
      top: this.coords.y + sysRect.getScaledHeight()/2 - sysRect.strokeWidth/2 + TEXT_PADDING,
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

      let Px = x, Py = y;

      // if (!sameRegion) {
      //   // m is the slope in the point-slope equation of a line
      //   const m = (y - this.coords.y) / (x - this.coords.x);
      //   Px = this.coords.x - 100;
      //   Py = m * (Px - this.coords.x) + this.coords.y;
      // }

      const line = new fabric.Line([Px, Py, this.coords.x, this.coords.y], opts);
      this._objs.push(
        line,
      )
    }

    this._objs.push(
      sysRect, nameTextbox,
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

  async findSystemById(systemId) {
    const sysData = await this._db.systems.get(systemId);
    if (sysData) {
      const sd = new SystemData(sysData);
      return new System(sd, this._canvas, this._db, this.opts);
    }
    return;
  }

  async findSystemByName(name) {
    const sysData = await this.findBy("systems", "n", name);
    if (sysData) {
      const sd = new SystemData(sysData);
      return new System(sd, this._canvas, this._db, this.opts);
    }
    return;
  }


  async drawReports(reports) {
    this.clearReportObjs();

    for (let report of reports) {
      const { sid, s } = report;

      const sys = this.findRendered(sid);
      const rect = sys._rect;

      const matrix = this._group.calcTransformMatrix();
      const { x, y } = fabric.util.transformPoint({ x: rect.left, y: rect.top }, matrix)
      const left = x - this._canvas.getWidth()/2;
      const top = y - this._canvas.getHeight()/2;

      // const x = rect.left + this._group.getScaledWidth()/2 + this._group.left - this._canvas.getWidth()/2;
      // const y = rect.top + this._group.getScaledHeight()/2 + this._group.top - this._canvas.getHeight()/2;

      const circle = new fabric.Circle({
        left,
        top,
        fill: lerpColor(theme.dangerYellow, theme.dangerRed, s),
        strokeWidth: 1,
        radius: lerp([0, 1], [REPORT_SYSTEM_MIN_RADIUS, REPORT_SYSTEM_MAX_RADIUS], s),
        selectable: false,
        hasControls: false,
        hasBorders: false,
        opacity: .3,
        originX: "center",
        originY: "center",
        evented: false,
      })

      this.addReportObj(circle);
      this._group.add(circle);
      this._canvas.sendToBack(circle);
    }
    this._canvas.requestRenderAll();
  }
}

export default SystemCollection;
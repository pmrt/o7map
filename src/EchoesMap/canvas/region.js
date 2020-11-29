import { fabric } from "fabric-with-gestures";
import { getSecColor, lerp, lerpColor, wrapText } from "../helpers";
import { REPORT_REGION_MIN_RADIUS, REPORT_REGION_MAX_RADIUS, TEXT_PADDING, MIN_TEXT_PADDING } from "./consts";
import theme from "./theme";

import MapCollection from "./collection";

export class RegionData {
  constructor(regionData) {
    const {
      id, n, sc, sec, sys, x, y
    } = regionData;

    this.ID = id;
    this.name = n;
    this.sec = sec;
    this.coords = { x, y };
    this.systems = sys;
    this.scale = sc;
  }
}

export class Region {
  constructor(regionData, canvas, db, opts) {
    this._regionData = regionData;
    this._canvas = canvas;
    this._db = db;
    this._objs = [];
    this.opts = opts;
  }

  get ID() {
    return this._regionData.ID;
  }

  get name() {
    return this._regionData.name;
  }

  get sec() {
    return this._regionData.sec || {
      sec: null,
      max: null,
      avg: null,
      str: null,
    };
  }

  get coords() {
    return this._regionData.coords;
  }

  get systems() {
    return this._regionData.systems;
  }

  get fabricObjs() {
    return this._objs;
  }

  calcCoords() {
    const rect = this._objs[0];
    const group = rect.group;
    return {
      x: rect.left + group.left + group.width/2,
      y: rect.top + group.top + group.height/2,
    }
  }

  clicked() {
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

          pulse.animate({
            radius: 20,
            opacity: 0,
          }, {
            onChange: this._canvas.renderAll.bind(this._canvas),
            duration: 150,
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

    const regionRect = new fabric.Rect({
      left: this.coords.x,
      top: this.coords.y,
      fill: color,
      width: this.opts.rectSize,
      height: this.opts.rectSize,
      angle: 45,
      strokeWidth: 20,
      selectable: false,
      hasControls: false,
      hoverCursor: 'pointer',
      originX: 'center',
      originY: 'center',
      metadata: {
        data: this,
      },
    });
    this._rect = regionRect;

    const nameTextbox = this._text = new fabric.Textbox(wrapText(this.name, 20), {
      width: 50,
      fontSize: this.opts.fontSize,
      fontFamily: "Roboto Mono",
      fill: theme.primary,
      textAlign: "center",
      metadata: {
        data: this,
      },
    })

    nameTextbox.set({
      left: this.coords.x - nameTextbox.getScaledWidth() / 2,
      top: this.coords.y + regionRect.getScaledHeight()/2 - regionRect.strokeWidth/2 + TEXT_PADDING,
    })

    this._objs.push(
      regionRect, nameTextbox,
    );

    return true;
  }
}


export class RegionCollection extends MapCollection {
  async getRegions() {
    return await this._db.regions.toArray();
  }

  get MapDataClass() {
    return RegionData;
  }

  get MapTypeClass() {
    return Region;
  }

  async findStartingWith(exp) {
    return await this._db.regions
      .where("n")
      .startsWithIgnoreCase(exp)
      .toArray();
  }

  async findSystemsInRegion(regionId) {
    const r = await this.findRegionById(regionId);
    if (!r) {
      return;
    }

    return r.systems;
  }

  async findRegionById(regionId) {
    const regionData = await this._db.regions.get(regionId);
    if (regionData) {
      const rd = new RegionData(regionData);
      return new Region(rd, this._canvas, this._db, this.opts);
    }
    return;
  }

  async findRegionByName(name) {
    const regionData = await this.findBy("regions", "n", name);
    if (regionData) {
      const rd = new RegionData(regionData);
      return new Region(rd, this._canvas, this._db, this.opts);
    }
    return;
  }

  async drawReports(reports) {
    this.clearReportObjs();

    for (let report of reports) {
      const { rid, s } = report;

      const region = this.findRendered(rid);
      const rect = region._rect;

      const matrix = this._group.calcTransformMatrix();
      const { x, y } = fabric.util.transformPoint({ x: rect.left, y: rect.top }, matrix)
      const left = x - this._canvas.getWidth()/2;
      const top = y - this._canvas.getHeight()/2;

      const circle = new fabric.Circle({
        left,
        top,
        fill: lerpColor(theme.dangerYellow, theme.dangerRed, s),
        strokeWidth: 1,
        radius: lerp([0, 1], [REPORT_REGION_MIN_RADIUS, REPORT_REGION_MAX_RADIUS], s),
        selectable: false,
        hasControls: false,
        hasBorders: false,
        opacity: .2,
        originX: "center",
        originY: "center",
        evented: false,
      })

      this.addReportObj(circle);
      this._group.add(circle);
    }

    this._canvas.requestRenderAll();
  }
}

export default RegionCollection;
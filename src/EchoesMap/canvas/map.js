import { fabric } from "fabric";
import Region, { RegionData } from "./region";

const MAX_ZOOM = 2;
const MIN_ZOOM = 1;
const STEP_FACTOR = .970;
const CANVAS_WIDTH_LIMIT = 2000;
const CANVAS_HEIGHT_LIMIT = 1200;

/*
* Map manages all the logic and map UI of the Eve Echoes Map.
*
* Map is agnostic to the UI layer which contains it, e.g. React. It's
* written in vanilla javascript so React is interchangeable
*/
class Map {
  constructor(fabricCanvas, logger) {
    this._canvas = fabricCanvas;
    this._maps = null;
    this._regions = null;
    this._logger = logger;
  }

  _onMouseWheel(opt) {
    const evt = opt.e;
    const zoom = this.canvas.getZoom();
    const delta = evt.deltaY;

    let newZoom = zoom * STEP_FACTOR ** delta;
    newZoom = Math.min(newZoom, MAX_ZOOM);
    newZoom = Math.max(newZoom, MIN_ZOOM);

    this.canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, newZoom);

    evt.preventDefault();
    evt.stopPropagation();
  }

  _onMouseDown(opt) {
    const evt = opt.e;

    if (opt.subTargets && opt.subTargets.length > 0) {
      return;
    }

    this.canvas.isDragging = true;
    this.canvas.selection = false;
    this.canvas.lastPosX = evt.clientX;
    this.canvas.lastPosY = evt.clientY;
  }

  _onMouseMove(opt) {
    const evt = opt.e;

    if (this.canvas.isDragging) {
      this.canvas.setCursor("grabbing");
      const zoom = this.canvas.getZoom();
      let vpt = this.canvas.viewportTransform;

      vpt[4] += evt.clientX - this.canvas.lastPosX;
      vpt[5] += evt.clientY - this.canvas.lastPosY;

      if (vpt[4] < this.canvas.getWidth() - CANVAS_WIDTH_LIMIT * zoom) {
        vpt[4] = this.canvas.getWidth() - CANVAS_WIDTH_LIMIT * zoom;
      } else if (vpt[4] > CANVAS_WIDTH_LIMIT * zoom - this.canvas.getWidth()) {
        vpt[4] = CANVAS_WIDTH_LIMIT * zoom - this.canvas.getWidth();
      }

      if (vpt[5] < this.canvas.getHeight() - CANVAS_HEIGHT_LIMIT * zoom) {
        vpt[5] = this.canvas.getHeight() - CANVAS_HEIGHT_LIMIT * zoom;
      } else if (vpt[5] > CANVAS_HEIGHT_LIMIT * zoom - this.canvas.getHeight()) {
        vpt[5] = CANVAS_HEIGHT_LIMIT * zoom - this.canvas.getHeight();
      }

      this.canvas.requestRenderAll();
      this.canvas.lastPosX = evt.clientX;
      this.canvas.lastPosY = evt.clientY;
    }
  }

  _onMouseUp(opt) {
    if (this.canvas.isDragging) {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.selection = true;
    }
    this.canvas.setCursor("default");
  }

  _onObjMouseDown(opt) {
    if (!opt.subTargets || opt.subTargets.length === 0) {
      this.log("ERR: User selected an object but not targets were found. Aborting...", "error");
      return;
    }

    if (opt.subTargets.length > 1) {
      this.log("ERR: User selected an object but +1 objects were found at those coordinates. Aborting...", "error");
      return
    }
 
    const obj = opt.subTargets[0];
    this.log("Selected: " + obj.get("metadata").name);
  }

  _setupEvents() {
    this.canvas.on("mouse:wheel", opt => {
      this._onMouseWheel(opt)
    });

    this.canvas.on("mouse:down", opt => {
      this._onMouseDown(opt);
    })

    this.canvas.on("mouse:move", opt => {
      this._onMouseMove(opt)
    });

    this.canvas.on("mouse:up", opt => {
      this._onMouseUp(opt)
    });

    this.regionGroup.forEachObject(obj => {
      obj.on("mousedown", opt => {
        this._onObjMouseDown(opt);
      })
    })

    return this;
  }

  async fetchMaps() {
    const maps = await fetch("maps.json");
    const resp = await maps.json()

    this._maps = resp.maps;

    if (!this._maps) {
      throw new Error("Map: failed to create map. Missing map data");
    }

    return this;
  }

  get canvas() {
    return this._canvas;
  }

  get regionGroup() {
    return this._regions;
  }

  get log() {
    return this._logger;
  }

  setup() {
    this._setupEvents();
    return this;
  }

  updateDimensions(w, h) {
    this.canvas.setDimensions({
      width: w,
      height: h
    })
    return this;
  }

  fillRegions() {
    let regions = [];

    for (let data of this._maps) {
      const rd = new RegionData(data);
      const region = new Region(this.canvas, rd);
      const ok = region.render();
      if (ok) {
        regions.push(region.fabricObj);
      }
    }

    this._regions = new fabric.Group(regions, {
      selectable: false,
      hasControls: false,
      subTargetCheck: true,
    });

    this.canvas.add(this.regionGroup);
    console.log(this.regionGroup)
    this.regionGroup.bringToFront();
    this.centerRegions();
    return this;
  }

  centerRegions() {
    this.regionGroup.center();
    return this;
  }
}

export default Map
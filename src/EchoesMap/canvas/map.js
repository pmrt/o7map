import RegionCollection from "./region";
import SystemCollection from "./system";

import {
  MAX_ZOOM,
  MIN_ZOOM,
  STEP_FACTOR,
  CANVAS_WIDTH_LIMIT,
  CANVAS_HEIGHT_LIMIT,
  FONTSIZE,
  MAX_FONTSIZE,
  MIN_FONTSIZE,
  MapType,
} from "./consts";

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
    this._regionCollection = new RegionCollection();
    this._sysCollection = new SystemCollection();
    this._logger = logger;
    this._currentMap = null;
  }

  _onMouseWheel(opt) {
    const evt = opt.e;
    const zoom = this._canvas.getZoom();
    const delta = evt.deltaY;

    let newZoom = zoom * STEP_FACTOR ** delta;
    newZoom = Math.min(newZoom, MAX_ZOOM);
    newZoom = Math.max(newZoom, MIN_ZOOM);

    this._canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, newZoom);

    switch (this._currentMap) {
      case MapType.REGION:
        let newFontSize = FONTSIZE / newZoom;
        newFontSize = Math.min(newFontSize, MAX_FONTSIZE);
        newFontSize = Math.max(newFontSize, MIN_FONTSIZE);
        this._regionCollection.updateFontSize(newFontSize);
        break;
      default:
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  _onMouseDown(opt) {
    const evt = opt.e;

    if (opt.subTargets && opt.subTargets.length > 0) {
      return;
    }

    this._canvas.isDragging = true;
    this._canvas.selection = false;
    this._canvas.lastPosX = evt.clientX;
    this._canvas.lastPosY = evt.clientY;
  }

  _onMouseMove(opt) {
    const evt = opt.e;

    if (this._canvas.isDragging) {
      this._canvas.setCursor("grabbing");
      const zoom = this._canvas.getZoom();
      let vpt = this._canvas.viewportTransform;

      vpt[4] += evt.clientX - this._canvas.lastPosX;
      vpt[5] += evt.clientY - this._canvas.lastPosY;

      if (vpt[4] < this._canvas.getWidth() - CANVAS_WIDTH_LIMIT * zoom) {
        vpt[4] = this._canvas.getWidth() - CANVAS_WIDTH_LIMIT * zoom;
      } else if (vpt[4] > CANVAS_WIDTH_LIMIT * zoom - this._canvas.getWidth()) {
        vpt[4] = CANVAS_WIDTH_LIMIT * zoom - this._canvas.getWidth();
      }

      if (vpt[5] < this._canvas.getHeight() - CANVAS_HEIGHT_LIMIT * zoom) {
        vpt[5] = this._canvas.getHeight() - CANVAS_HEIGHT_LIMIT * zoom;
      } else if (vpt[5] > CANVAS_HEIGHT_LIMIT * zoom - this._canvas.getHeight()) {
        vpt[5] = CANVAS_HEIGHT_LIMIT * zoom - this._canvas.getHeight();
      }

      this._canvas.requestRenderAll();
      this._canvas.lastPosX = evt.clientX;
      this._canvas.lastPosY = evt.clientY;
    }
  }

  _onMouseUp(opt) {
    if (this._canvas.isDragging) {
      this._canvas.setViewportTransform(this._canvas.viewportTransform);
      this._canvas.isDragging = false;
      this.selection = true;
    }
    this._canvas.setCursor("default");
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
    switch (this._currentMap) {
      case MapType.REGION:
        const sysData = obj.get("metadata").systems;
        this.fill(MapType.SYSTEM, sysData);
        break;
      default:
    }
  }

  _setupEvents() {
    this._canvas.on("mouse:wheel", opt => {
      this._onMouseWheel(opt)
    });

    this._canvas.on("mouse:down", opt => {
      this._onMouseDown(opt);
    })

    this._canvas.on("mouse:move", opt => {
      this._onMouseMove(opt)
    });

    this._canvas.on("mouse:up", opt => {
      this._onMouseUp(opt)
    });

    this._regionCollection.on("mousedown", opt => {
      this._onObjMouseDown(opt);
    }, "rect");

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

  get log() {
    return this._logger;
  }

  setup() {
    this._setupEvents();
    return this;
  }

  updateDimensions(w, h) {
    this._canvas.setDimensions({
      width: w,
      height: h
    })
    return this;
  }

  fill(type, ...args) {
    this.clear();
    
    switch (type) {
      case MapType.REGION:
        this.fillRegions.apply(this, args);
        break;
      case MapType.SYSTEM:
        this.fillSystem.apply(this, args);
        break;
      default:
        this.log("ERR: Couldn't fill map. Bad type of map type.", "error");
        this._currentMap = null;

        // stop here
        return this;
    }

    this._currentMap = type;

    return this;
  }

  fillSystem(sysData) {
    const { errors } = this._sysCollection.render(sysData);
    if (errors.length > 0) {
      for (let err of errors) {
        this.log(err.message, err.type);
      }
    }
    
    this._canvas.add(this._sysCollection.group);
    this._sysCollection
      .center()
      .bringToFront();

    return this;
  }

  fillRegions() {
    const { errors } = this._regionCollection.render(this._maps);
    if (errors.length > 0) {
      for (let err of errors) {
        this.log(err.message, err.type);
      }
    }

    this._canvas.add(this._regionCollection.group);
    this._regionCollection
      .center()
      .bringToFront();

    return this;
  }

  clear() {
    if (!this._currentMap) {
      // skip if nothing is rendered
      return;
    }
    
    // clear the corresponding rendered section
    switch (this._currentMap) {
      case MapType.REGION:
        this._regionCollection.clear();
        break;
      case MapType.SYSTEM:
        this._sysCollection.clear();
        break;
      default:
    }
    // clear the canvas (but keep the canvas event listeners)
    this._canvas.clear();

    return this;
  }
}

export default Map;
import EventEmitter from "./event";

import RegionCollection, { Region, RegionData } from "./region";
import SystemCollection from "./system";

import {
  MAX_ZOOM,
  MIN_ZOOM,
  STEP_FACTOR,
  CANVAS_WIDTH_LIMIT,
  CANVAS_HEIGHT_LIMIT,
  FONTSIZE,
  MIN_FONTSIZE,
  MapType,
  LINK_WIDTH,
} from "./consts";

function defer(fn) {
  setTimeout(fn, 0);
}

/*
* Map manages all the logic and map UI of the Eve Echoes Map.
*
* Map is agnostic to the UI layer which contains it, e.g. React. It's
* written in vanilla javascript so React is interchangeable
*
* Events:
* - render:universe. After regions render.
* - render:region. After a specific region render.
* - clicked:region. Triggered when a region is clicked.
* - clicked:system. Triggered when a system is clicked.
* - clicked:system:external. Triggered when a system outside of current rendered region is clicked.
*/
class Map extends EventEmitter {
  constructor(fabricCanvas, logger, setIsLoading, opts={}) {
    super();

    this.opts = {
      fontSize: FONTSIZE,
      linkWidth: LINK_WIDTH,
      ...opts,
    };

    this._canvas = fabricCanvas;
    this._maps = null;
    this._regionCollection = new RegionCollection(fabricCanvas, this.opts);
    this._sysCollection = new SystemCollection(fabricCanvas, this.opts);
    this._logger = logger;
    this._setIsLoading = setIsLoading;
    this._currentMap = null;
    this._currentRegionName = "";
  }

  _onMouseWheel(opt) {
    const evt = opt.e;
    const zoom = this._canvas.getZoom();
    const delta = evt.deltaY;

    let newZoom = zoom * STEP_FACTOR ** delta;
    newZoom = Math.min(newZoom, MAX_ZOOM);
    newZoom = Math.max(newZoom, MIN_ZOOM);

    this._canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, newZoom);

    let newFontSize = this.opts.fontSize / newZoom;
    newFontSize = Math.min(newFontSize, this.opts.fontSize);
    newFontSize = Math.max(newFontSize, MIN_FONTSIZE);
    this.updateFontSize(newFontSize);

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

  _onObjMouseOver(opt) {
    const obj = opt.target;
    switch (this._currentMap) {
      case MapType.REGION:
        const system = obj.get("metadata").data;

        const rn = system.regionName;
        if (this._currentRegionName !== rn) {
          obj.hoverCursor = "pointer";
        }
        break;
      default:
    }
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
      case MapType.UNIVERSE:
        const region = obj.get("metadata").data;

        region.clicked().then(() => {
          this.emit("clicked:region", region);

          this.drawRegion(region);
        });
        break;

      case MapType.REGION:
        const system = obj.get("metadata").data;

        const rn = system.regionName;
        if (this._currentRegionName !== rn) {
          system.clicked().then(() => {
            this.emit("clicked:system:external", system);
            const regionData = this.findRegionByName(rn);

            if (!regionData) {
              this.log(`WARN: Couldn't find region '${rn}'`, "warn");
            }

            this.drawRegion(regionData);
          });

        } else {
          this.emit("clicked:system", system);
        }

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

    this._sysCollection.on("mousedown", opt => {
      this._onObjMouseDown(opt);
    }, "rect");

    this._sysCollection.on("mouseover", opt => {
      this._onObjMouseOver(opt);
    }, "rect");

    return this;
  }

  findRegionByName(name) {
    for (let region of this._maps) {
      if (region.mapName === name) {
        const rd = new RegionData(region);
        return new Region(rd, this._canvas, this.opts);
      }
    }
  }

  drawRegion(region) {
    const { ID, name, systems, avgSec } = region;
    this.setIsLoading(true);
    this.log(`:: Rendering region '${name}'`);

    defer(() => {
      const start = performance.now();

      this._fill(MapType.REGION, systems);

      const end = performance.now();
      this.log(`Finished task: Rendering '${name}'. Took ${Math.ceil(end - start)}ms.`);
      this.emit("render:region", {
        rid: ID,
        rn: name,
        avgSec,
      });
      this.setIsLoading(false);
    })


    this._currentRegionName = name;
  }

  drawUniverse() {
    this.setIsLoading(true);
    this.log(":: Rendering universe");

    defer(() => {
      const start = performance.now();
      this._fill(MapType.UNIVERSE);
      const end = performance.now();
      this.log(`Finished task: Rendering universe. Took ${Math.ceil(end - start)}ms.`);

      this.emit("render:universe");
      this.setIsLoading(false);
    });

    this._currentRegionName = null;
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

  get setIsLoading() {
    return this._setIsLoading;
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

  _fill(type, ...args) {
    this.clear();

    switch (type) {
      case MapType.UNIVERSE:
          this.fillRegions.apply(this, args);
        break;
      case MapType.REGION:
          this.fillSystem.apply(this, args);
        break;
      default:
        this.log("ERR: Couldn't fill map. Bad type of map type.", "error");
        this._currentMap = null;

        // stop here
        return this;
    }

    this._canvas.setZoom(1)
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

    const links = this._sysCollection.getLinks();
    links.forEach(obj => {
      this._canvas.sendBackwards(obj);
    })

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

  /* */
  updateFontSize(newFontSize) {
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.updateFontSize(newFontSize);
        break;
      case MapType.REGION:
        this._sysCollection.updateFontSize(newFontSize);
        break;
      default:
        this.log(`Cannot update fontSize. Incorrect MapType: ${this._currentMap}`, "error");
        return;
    }
  }


  setFontSize(newFontSize) {
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.updateFontSize(newFontSize);
        break;
      case MapType.REGION:
        this._sysCollection.updateFontSize(newFontSize);
        break;
      default:
        this.log(`Cannot set fontSize. Incorrect MapType: ${this._currentMap}`, "error");
        return;
    }

    this.opts.fontSize = newFontSize;
    this._canvas.requestRenderAll();
  }

  center() {
    if (!this._currentMap) {
      // skip if nothing is rendered
      return;
    }

    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.center();
        break;
      case MapType.REGION:
        this._sysCollection.center();
        break;
      default:
        this.log(`Cannot center map. Incorrect MapType: ${this._currentMap}`, "error");
        return;
    }

    return this;
  }

  clear() {
    if (!this._currentMap) {
      // skip if nothing is rendered
      return;
    }

    // clear the corresponding rendered section
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.clear();
        break;
      case MapType.REGION:
        this._sysCollection.clear();
        break;
      default:
        this.log(`Cannot clear map. Incorrect MapType: ${this._currentMap}`, "error");
        return;
    }
    // clear the canvas (but keep the canvas event listeners)
    this._canvas.clear();

    return this;
  }
}

export default Map;
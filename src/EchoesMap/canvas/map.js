import Dexie from "dexie";

import EventEmitter from "./event";

import RegionCollection from "./region";
import SystemCollection from "./system";

import {
  MAX_ZOOM,
  MIN_ZOOM,
  STEP_FACTOR,
  RECT_SIZE,
  MIN_RECT_SIZE,
  CANVAS_WIDTH_LIMIT,
  CANVAS_HEIGHT_LIMIT,
  FONTSIZE,
  MIN_FONTSIZE,
  MapType,
  LINK_WIDTH,
  DATABASE_NAME,
  DATABASE_VERSION_STORAGE_KEY,
  lastDatabaseVersion,
} from "./consts";
// import { fabric } from "fabric-";
import { fabric } from "fabric-with-gestures";

import theme from "./theme";

function defer(fn) {
  setTimeout(fn, 0);
}

function insertMap(db, universe, update) {
  return new Promise((resolve, reject) => {
    db.transaction("rw", db.regions, db.systems, async () => {
      if (update) {
        await db.regions.clear();
        await db.systems.clear();
      }
      await db.regions.bulkAdd(universe.r);
      await db.systems.bulkAdd(universe.s);

      resolve();
    }).catch(err => reject(err));
  })
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
* - mousedown:pointer. Triggered on mouse down. Contains canvas coordinates.
*/
class Map extends EventEmitter {
  init(fabricCanvas, logger, setIsLoading, opts) {
    this.opts = {
      fontSize: FONTSIZE,
      rectSize: RECT_SIZE,
      linkWidth: LINK_WIDTH,
      ...opts,
    };

    this._fistRender = true;

    this._db = null;
    this._setupDatabase();
    this._canvas = fabricCanvas;
    this._maps = null;
    this._regionCollection = new RegionCollection(fabricCanvas, this._db, this.opts);
    this._sysCollection = new SystemCollection(fabricCanvas, this._db, this.opts);
    this._logger = logger;
    this._setIsLoading = setIsLoading;
    this._currentMap = null;
    this._currentRegionId = null;
    this._mouseHoverSelection = [];

    return this;
  }

  /*
    setupDatabase initializes and setups the database. Note that the database version
    is different from the data version itself, that way you can update the data without
    updating the database.

    In general, the recommended way to update the database data is to create a json with
    only the needed data for the update, create a new database version and modify it with
    the new update, so clients don't have to re-fetch the entire database saving bandwidth.
    You'll need to fetch the data before creating/opening the database or modify the "ready"
    handler and create a version patch management.
  */
  _setupDatabase() {
    this._searchId = null;
    this._db = new Dexie(DATABASE_NAME);
    this._db.version(1).stores({
      regions: "id, &n, sec.avg",
      systems: "id, &n, sec.sec, rg.id, rg.n, [rg.n+x], st, cn.id, cn.n",
    });

    this._db.on("ready", () => {
      return this._db.regions.count(count => {
        const v = window.localStorage.getItem(DATABASE_VERSION_STORAGE_KEY) || 0;
        const isUpdateAvailable = v < lastDatabaseVersion;

        if (count > 0) {
          if (!isUpdateAvailable) {
            this.log(":: Local database already updated to last version");
            return Promise.resolve();
          }
          this.log(":: Database update available");
        } else {
          this.log(":: Local database empty");
        }

        let start, end;

        this.log(":: Fetching map data..")
        start = performance.now();
        return fetch("/map/universe.json")
          .then(resp => {
            end = performance.now();
            this.log(`Finished task: fetching. Took ${Math.ceil(end - start)}ms.`);
            return resp.json()
          })
          .then(universe => {
            this.log(":: Inserting map data to local database..")
            start = performance.now();
            return insertMap(this._db, universe, isUpdateAvailable);
          }).then(() => {
            end = performance.now();

            window.localStorage.setItem(DATABASE_VERSION_STORAGE_KEY, lastDatabaseVersion);
            let msg = `Finished task: Inserting. Took ${Math.ceil(end - start)}ms.`;
            if (isUpdateAvailable) {
              msg = [
                msg,
                ":: Database updated"
              ]
            }
            this.log(msg);
          }).catch(err => {
            this.log([
              `ERR: Error when populating local db`,
              err,
            ], "error");
          });
      })
    })
  }

  _onZoom(opt) {
    const evt = opt.e;
    const zoom = this._canvas.getZoom();

    let newZoom, Px, Py;
    if (evt.touches && evt.touches.length === 2) {
      const { state, x, y } = opt.self;
      if (state === "start") {
        this._zoomStart = this._canvas.getZoom();
      }
      newZoom = this._zoomStart * opt.self.scale;
      Px = x;
      Py = y;
    } else {
      const { deltaY, offsetX, offsetY } = evt;
      newZoom = zoom * STEP_FACTOR ** deltaY;
      newZoom = Math.min(newZoom, MAX_ZOOM);
      newZoom = Math.max(newZoom, MIN_ZOOM);
      Px = offsetX;
      Py = offsetY;
    }

    this._canvas.zoomToPoint({ x: Px, y: Py }, newZoom);

    let newFontSize = this.opts.fontSize
    / newZoom;
    newFontSize = Math.min(newFontSize, this.opts.fontSize);
    newFontSize = Math.max(newFontSize, MIN_FONTSIZE);
    if (newZoom < .75) {
      newFontSize = 0;
    }
    this.updateFontSize(newFontSize);

    let newRectSize = this.opts.rectSize / newZoom;
    newRectSize = Math.min(newRectSize, this.opts.rectSize);
    newRectSize = Math.max(newRectSize, MIN_RECT_SIZE);
    this.updateRectSize(newRectSize);

    evt.preventDefault();
    evt.stopPropagation();
  }

  _onMouseDown(opt) {
    this.emit("mousedown:pointer", opt.pointer);

    const evt = opt.e;

    // if (evt.touches && evt.touches.length >= 2) {
    //   return;
    // }

    this._canvas.isDragging = true;
    this._canvas.selection = false;
    this._canvas.lastPosX = evt.clientX || evt.layerX;
    this._canvas.lastPosY = evt.clientY || evt.layerY;
  }

  _onMouseUp(opt) {
    if (this._canvas.isDragging) {
      this._canvas.setViewportTransform(this._canvas.viewportTransform);
      this._canvas.isDragging = false;
      this.selection = true;
    }
    this._canvas.setCursor("default");
  }

  _onMouseMove(opt) {
    const evt = opt.e;

    if (this._canvas.isDragging) {
      const x = evt.clientX || evt.layerX;
      const y = evt.clientY || evt.layerY;

      this._canvas.setCursor("grabbing");
      const zoom = this._canvas.getZoom();
      let vpt = this._canvas.viewportTransform;

      vpt[4] += x - this._canvas.lastPosX;
      vpt[5] += y - this._canvas.lastPosY;

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
      this._canvas.lastPosX = x;
      this._canvas.lastPosY = y;
    }
  }

  _onObjMouseOver(opt) {
    const obj = opt.target;
    switch (this._currentMap) {
      case MapType.REGION:
        const system = obj.get("metadata").data;

        const id = system.region.id;
        if (this._currentRegionId !== id) {
          obj.hoverCursor = "nw-resize";
        }
        break;
      default:
    }

    obj.set({ fill: theme.active });
    this._mouseHoverSelection.push(obj);
    this._canvas.requestRenderAll();
  }

  _onObjMouseOut(opt) {
    const obj = opt.target;
    if (obj) {
      const md = obj.get("metadata");
      if (md) {
        obj.set({ fill: md.ogColor });
      }
      this._mouseHoverSelection.splice(this._mouseHoverSelection.indexOf(obj), 1);
      console.log(this._mouseHoverSelection);
      this._canvas.requestRenderAll();
    }
  }

  _onMouseOut() {
    const sel = this._mouseHoverSelection;
    console.log(this._mouseHoverSelection);
    for (let i=0, len = sel.length; i<len; i++) {
      const obj = sel[i];
      if (obj) {
        const md = obj.get("metadata");
        if (md) {
          obj.set({ fill: md.ogColor });
        }
      }
      this._mouseHoverSelection.splice(i, 1);
    }
    this._canvas.requestRenderAll();
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

        const id = system.region.id;
        if (this._currentRegionId !== id) {
          system.clicked()
            .then(() => {
              this.emit("clicked:system:external", system);
              return this._regionCollection.findRegionById(id);
            })
            .then(region => {
              if (!region) {
                this.log(`WARN: Couldn't find region id:'${id}'`, "warn");
                return;
              }

              this.drawRegion(region);
            })

        } else {
          this.emit("clicked:system", system);
        }

        break;
      default:
    }
  }

  _setupEvents() {
    this._canvas.on("mouse:wheel", opt => {
      this._onZoom(opt)
    });

    this._canvas.on('touch:gesture', opt => {
      this._onZoom(opt)
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

    this._regionCollection.on("mouseover", opt => {
      this._onObjMouseOver(opt);
    }, "rect");

    this._regionCollection.on("mouseout", opt => {
      this._onObjMouseOut(opt);
    }, "rect");

    this._canvas.on("mouse:out", opt => {
      this._onMouseOut(opt)
    });

    this._sysCollection.on("mousedown", opt => {
      this._onObjMouseDown(opt);
    }, "rect");

    this._sysCollection.on("mouseover", opt => {
      this._onObjMouseOver(opt);
    }, "rect");

    this._sysCollection.on("mouseout", opt => {
      this._onObjMouseOut(opt);
    }, "rect");

    return this;
  }

  isRendered() {
    return this._currentMap !== null;
  }

  drawRegion(region) {
    return new Promise((resolve, reject) => {
      const { ID, name, systems, sec } = region;
      this.setIsLoading(true);
      this.log(`:: Rendering region '${name}'`);

      defer(async () => {
        const start = performance.now();

        await this._fill(MapType.REGION, ID, systems);

        const end = performance.now();
        this.log(`Finished task: Rendering '${name}'. Took ${Math.ceil(end - start)}ms.`);
        this._currentRegionId = ID;
        this.emit("render:region", {
          rid: ID,
          rn: name,
          avgSec: sec.avg,
        });
        this.setIsLoading(false);
        resolve(region);
      })
    });
  }

  drawUniverse() {
    return new Promise((resolve, reject) => {
      this.setIsLoading(true);
      this.log(":: Rendering universe");

      defer(async () => {
        const start = performance.now();
        await this._fill(MapType.UNIVERSE);
        const end = performance.now();
        this.log(`Finished task: Rendering universe. Took ${Math.ceil(end - start)}ms.`);

        if (this._fistRender) {
          const maxQuoteFakeTime = 2500;
          const quoteTime = Math.max(0, maxQuoteFakeTime - (end - start));
          // Making sure that we see the quote splash screen by faking the loading
          // screen first time
          setTimeout(() => {
            this.setIsLoading(false);
          }, quoteTime);
          this._fistRender = false;
        } else {
          this.setIsLoading(false);
        }

        this._currentMap = MapType.UNIVERSE;
        this._currentRegionId = null;
        this.centerInViewPort();
        this.emit("render:universe");
        resolve();
      });
    })
  }

  drawReports(reports) {
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.drawReports(reports);
        break;
      case MapType.REGION:
        this._sysCollection.drawReports(reports);
        break;
      default:
        this.log(`Cannot update drawReports. Wrong MapType: ${this._currentMap}`, "error");
        return;
    }
  }

  clearReports() {
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.clearReportObjs();
        break;
      case MapType.REGION:
        this._sysCollection.clearReportObjs();
        break;
      default:
        this.log(`Cannot clear reports. Wrong MapType: ${this._currentMap}`, "error");
        return;
    }
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

  getCurrentMapType() {
    return this._currentMap;
  }

  async _fill(type, ...args) {
    if (this._canvas.isDragging) {
      return;
    }

    this.clear();

    switch (type) {
      case MapType.UNIVERSE:
          await this.fillUniverse.apply(this, args);
        break;
      case MapType.REGION:
          this.fillRegion.apply(this, args);
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

  fillRegion(regionId, sysData) {
    const { errors } = this._sysCollection.render(sysData, regionId);
    if (errors.length > 0) {
      for (let err of errors) {
        this.log(err.message, err.type);
      }
    }

    this._canvas.add(this._sysCollection.group);
    this._sysCollection.center();
    this._sysCollection.centerRegionSystems();
    this._sysCollection.afterRender()
      .bringToFront();
    return this;
  }

  async fillUniverse() {
    const regions = await this._regionCollection.getRegions();
    const { errors } = this._regionCollection.render(regions);
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
    if (!this._currentMap) {
      return null;
    }

    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.updateFontSize(newFontSize);
        break;
      case MapType.REGION:
        this._sysCollection.updateFontSize(newFontSize);
        break;
      default:
        this.log(`Cannot update fontSize. Wrong MapType: ${this._currentMap}`, "error");
        return;
    }
  }

  updateRectSize(size) {
    if (!this._currentMap) {
      return null;
    }

    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.updateRectSize(size);
        break;
      case MapType.REGION:
        this._sysCollection.updateRectSize(size);
        break;
      default:
        this.log(`Cannot . Wrong MapType: ${this._currentMap}`, "error");
        return;
    }
  }

  setFontSize(newFontSize) {
    if (!this._currentMap) {
      return null;
    }

    switch (this._currentMap) {
      case MapType.UNIVERSE:
        this._regionCollection.updateFontSize(newFontSize);
        break;
      case MapType.REGION:
        this._sysCollection.updateFontSize(newFontSize);
        break;
      default:
        this.log(`Cannot set fontSize. Wrong MapType: ${this._currentMap}`, "error");
        return;
    }

    this.opts.fontSize = newFontSize;
    this._canvas.requestRenderAll();
  }

  async goTo(regionName, systemName) {
    const region = await this._regionCollection.findRegionByName(regionName);

    if (!region) {
      this.log(`ERR: Couldn't go to unknown region '${regionName}'`, "error")
      return;
    }

    await this.drawRegion(region);

    const c = this._canvas;

    if (!systemName) {
      return region;
    }

    c.setZoom(1)
    let w = c.getWidth();
    let h = c.getHeight();

    const system = this._sysCollection.findRenderedSystem(systemName);
    const obj = system._rect;
    if (!obj) {
      this.log(`ERR: Couldn't goTo() unknown system '${systemName}'`, "error")
      return;
    }
    const group = obj.group;

    const x = group.left + group.getScaledWidth()/2 + obj.left - w/2;
    const y = group.top + group.getScaledHeight()/2 + obj.top - h/2;
    c.absolutePan(new fabric.Point(x, y));
    return system;
  }

  centerInViewPort() {
    if (!this._currentMap) {
      // skip if nothing is rendered
      return;
    }

    let group;
    switch (this._currentMap) {
      case MapType.UNIVERSE:
        group = this._regionCollection.group;
        break;
      case MapType.REGION:
        group = this._sysCollection.group;
        break;
      default:
        this.log(`Cannot center map. Incorrect MapType: ${this._currentMap}`, "error");
        return;
    }

    const c = this._canvas;
    const zoom = c.getZoom();
    const panX = ((c.getWidth() / zoom / 2) - (group.aCoords.tl.x) - (group.getScaledWidth() / 2)) * zoom;
    const panY = ((c.getHeight() / zoom / 2) - (group.aCoords.tl.y) - (group.getScaledHeight() / 2)) * zoom;
    c.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);

    return this;
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
        this._sysCollection.centerRegionSystems();
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

  cleanup() {
    this.off();
    this._db.close();
  }

  async findStartingWith(mapType, exp) {
    let results;
    switch (mapType) {
      case MapType.REGION:
        results = await this._regionCollection.findStartingWith(exp);
        return [this._searchId++, results];
      case MapType.SYSTEM:
        results = await this._sysCollection.findStartingWith(exp);
        return [this._searchId, results];
      default:
    }

    return null;
  }

  async getCurrentSystems() {
    if (this._currentMap !== MapType.REGION) {
      return;
    }

    return await this.getSystemsInRegion(this._currentRegionId);
  }

  async getSystemsInRegion(regionId) {
    const results =  await this._regionCollection.findSystemsInRegion(regionId);
    return [this._searchId++, results];
  }

  async getSystemById(systemId) {
    return await this._sysCollection.findSystemById(systemId);
  }
}

export default Map;
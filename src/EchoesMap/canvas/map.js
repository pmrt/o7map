import { fabric } from "fabric";
import Region, { RegionData } from "./region";

/*
* Map manages all the logic and map UI of the Eve Echoes Map.
*
* Map is agnostic to the UI layer which contains it, e.g. React. It's
* written in vanilla javascript so React is interchangeable
*/
class Map {
  constructor(fabricCanvas) {
    this._canvas = fabricCanvas;
    this._maps = null;
    this._regions = null;
  }

  _setupEvents() {
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
      region.render();
      regions.push(region.fabricObj);
    }

    this._regionGroup = new fabric.Group(regions, {
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasControls: false,
    });

    this.canvas.add(this._regionGroup);
    this.centerRegions();
    return this;
  }

  centerRegions() {
    this._regionGroup.center();
    return this;
  }
}

export default Map
import Contextual from "./Contextual";
import Mapbar from "./Mapbar";

import "./MapInfo.css";

function MapInfo() {
  return (
    <div className="map-info">
      <Mapbar />
      <Contextual />
    </div>
  )
}

export default MapInfo;
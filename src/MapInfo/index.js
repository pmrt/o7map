import Contextual from "./Contextual";
import Mapbar from "./Mapbar";

import "./MapInfo.css";

function MapInfo({ currentMap, isLoading, cmdRef }) {
  return (
    <div className="map-info">
      <Mapbar
        cmdRef={cmdRef}
      />
      <Contextual
        isLoading={isLoading}
        currentMap={currentMap}
      />
    </div>
  )
}

export default MapInfo;
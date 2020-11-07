import Contextual from "./Contextual";
import Mapbar from "./Mapbar";

import "./MapInfo.css";

function MapInfo({ currentMap, isLoading, cmdRef, isDevMode, clickedCoords }) {
  return (
    <div className="map-info">
      <Mapbar
        cmdRef={cmdRef}
      />
      <Contextual
        clickedCoords={clickedCoords}
        isDevMode={isDevMode}
        isLoading={isLoading}
        currentMap={currentMap}
      />
    </div>
  )
}

export default MapInfo;
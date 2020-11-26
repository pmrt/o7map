import { useContext } from "react";
import { RootContext } from "../context";
import "./Contextual.css";

function Contextual() {
  const { store } = useContext(RootContext);
  const { currentMap, isLoading, isDevMode, clickedCoords} = store;
  const { mapID, mapName, mapSec } = currentMap;

  const Loader = isLoading
    ? (
      <div className="loader-wrapper">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    )
    : null;

  return (
    <div className="contextual-wrapper">
      {Loader}
      <div className="contextual">
        <h1>{ mapName || "Universe" }</h1>
        <ul>
          { !!isDevMode && !!mapID && <li>id: {mapID}</li> }
          { !!mapSec && <li>sec: {mapSec}</li> }
          { !!isDevMode && <li>click_coord x:{clickedCoords.x} y:{clickedCoords.y}</li> }
        </ul>
      </div>
    </div>
  )
}

export default Contextual;
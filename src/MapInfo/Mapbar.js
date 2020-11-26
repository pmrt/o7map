import { useCallback, useContext } from "react";

import centerWebp from "../img/center.webp";
import centerPng from "../img/center.png";

import "./Mapbar.css";
import { RootContext } from "../context";

function Mapbar() {
  const { cmdRef, store } = useContext(RootContext);
  const { currentMap, isReceivingReports } = store;

  const onUniverseClick = useCallback(() => {
    const cmd = cmdRef.current;
    if (!cmd) {
      return null;
    }

    cmd.exec(["map", "render", "universe"]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCenterClick = useCallback(() => {
    const cmd = cmdRef.current;
    if (!cmd) {
      return null;
    }

    cmd.exec(["map", "center"]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mapbar">
      { !!currentMap.mapName && <div className="mapbar-btn" onClick={onUniverseClick}>&lt; Universe</div>}
      <div className="mapbar-btn mapbar-img-btn"
        onClick={onCenterClick}
      >
        <img
          alt="Center map"
          src={centerWebp}
          onError={(e) => { e.target.onerror = null; e.target.src = centerPng }}
        />
      </div>
      <div className={isReceivingReports ? "mapbar-btn receiving is-receiving" : "mapbar-btn receiving not-receiving"}>
        Report system
      </div>
    </div>
  )
}

export default Mapbar;
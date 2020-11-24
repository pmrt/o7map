import { useCallback, useContext } from "react";

import "./Sidebar.css"

// import addWebp from "../img/add.webp";
// import addPng from "../img/add.png";

// import filterWebp from "../img/filter.webp";
// import filterPng from "../img/filter.png";

import planetWebp from "../img/planet.webp";
import planetPng from "../img/planet.png";

import searchWebp from "../img/search.webp";
import searchPng from "../img/search.png";

import settingsWebp from "../img/settings.webp";
import settingsPng from "../img/settings.png";

import { RootDispatch } from "../context";
import { setPanelVisibility } from "../actions";
import { Tools } from "../constants";

function getUser() {
  // const document.cookie.split("; ")
}

function Sidebar({ activeTools }) {
  const dispatch = useContext(RootDispatch);

  const isSettingsVisible = activeTools[Tools.SETTINGS];
  const isSearchVisible = activeTools[Tools.SEARCH];

  const onSettingsClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.SETTINGS, !isSettingsVisible))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettingsVisible]);

  const onSearchClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.SEARCH, !isSearchVisible))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchVisible]);

  return (
    <div className="sidebar">
      <div
      className={`sidebar-icon ${isSearchVisible ? "active": ""}`}
      alt="Search tool"
      onClick={onSearchClick}>
        <img
        alt="Search tool"
        src={searchWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = searchPng }}
        >
        </img>
      </div>

      <div className="sidebar-icon" alt="Planet tool (Coming soon)">
        <img
        alt="Planet tool"
        src={planetWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = planetPng }}
        >
        </img>
      </div>

      <div
      className={`sidebar-icon ${isSettingsVisible ? "active": ""}`}
      alt="Console and Settings"
      onClick={onSettingsClick}>
        <img
        alt="Terminal and Settings"
        src={settingsWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = settingsPng }}
        >
        </img>
      </div>
    </div>
  )
}

export default Sidebar;
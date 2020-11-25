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

import logoutWebp from "../img/logout.webp";
import logoutPng from "../img/logout.png";

import defaultUserWebp from "../img/user.webp";
import defaultUserPng from "../img/user.png";

import { RootDispatch } from "../context";
import { setPanelVisibility } from "../actions";
import { Tools } from "../constants";


function Sidebar({ activeTools, userInfo }) {
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
      <div className="sidebar-top">
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

      <div className="sidebar-bottom">
        <a
          className="sidebar-icon"
          alt="Logout session"
          style={{ display: !!userInfo ? "block" : "none" }}
          href="/logout/discord"
          >
            <img
            alt="Logout button"
            src={logoutWebp}
            onError={(e) => { e.target.onerror = null; e.target.src = logoutPng }}
            >
            </img>
        </a>
        <div
          className={`sidebar-icon login-btn`}
          alt={!!userInfo ? "User Profile" : "Log in"}
          >
            <img
            alt={!!userInfo ? "User Avatar" : "Default avatar"}
            src={!!userInfo ? userInfo.avatarURL : defaultUserWebp }
            onError={(e) => { e.target.onerror = null; e.target.src = defaultUserPng }}
            >
            </img>
          </div>
        </div>
    </div>
  )
}

export default Sidebar;
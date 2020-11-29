import { useCallback, useContext } from "react";

import "./Sidebar.css"

// import addWebp from "../img/add.webp";
// import addPng from "../img/add.png";

// import filterWebp from "../img/filter.webp";
// import filterPng from "../img/filter.png";

// import planetWebp from "../img/planet.webp";
// import planetPng from "../img/planet.png";

import searchWebp from "../img/search.webp";
import searchPng from "../img/search.png";

import settingsWebp from "../img/settings.webp";
import settingsPng from "../img/settings.png";

import feedbackWebp from "../img/feedback.webp";
import feedbackPng from "../img/feedback.png";

import { RootContext, UserContext } from "../context";
import { setPanelVisibility } from "../actions";
import { Tools } from "../constants";

import LoginButton from "./LoginButton";

function Sidebar() {
  const { store, dispatch } = useContext(RootContext);
  const { userInfo } = useContext(UserContext);
  const { activeTools } = store;

  const isSettingsVisible = activeTools[Tools.SETTINGS];
  const onSettingsClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.SETTINGS, !isSettingsVisible))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettingsVisible]);

  const isSearchVisible = activeTools[Tools.SEARCH];
  const onSearchClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.SEARCH, !isSearchVisible))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchVisible]);

  const isFeedbackVisible = activeTools[Tools.FEEDBACK];
  const onFeedbackClick = useCallback(() => {
    dispatch(setPanelVisibility(Tools.FEEDBACK, !isFeedbackVisible))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFeedbackVisible]);


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

        {/* <div className="sidebar-icon" alt="Planet tool (Coming soon)">
          <img
          alt="Planet tool"
          src={planetWebp}
          onError={(e) => { e.target.onerror = null; e.target.src = planetPng }}
          >
          </img>
        </div> */}

        <div
        className={`sidebar-icon ${isSettingsVisible ? "active": ""}`}
        alt="Console and Settings"
        onClick={onSettingsClick}>
          <img
          alt="Console and Settings"
          src={settingsWebp}
          onError={(e) => { e.target.onerror = null; e.target.src = settingsPng }}
          >
          </img>
        </div>
      </div>

      <div className="sidebar-bottom">
      <div
        className={`sidebar-icon ${isFeedbackVisible ? "active": ""}`}
        alt="Feedback"
        onClick={onFeedbackClick}>
          <img
          alt="Feedback"
          src={feedbackWebp}
          onError={(e) => { e.target.onerror = null; e.target.src = feedbackPng }}
          >
          </img>
        </div>
        <LoginButton userInfo={userInfo} />
      </div>
    </div>
  )
}

export default Sidebar;
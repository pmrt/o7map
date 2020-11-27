import { useCallback, useContext, useState } from "react";

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

import { RootContext, UserContext } from "../context";
import { setPanelVisibility } from "../actions";
import { Tools } from "../constants";

import dcLogo from "../img/dc_logo_white.png";

const LoginPanel = ({ isVisible, userInfo }) => {
  if (!isVisible) {
    return null;
  }
  return <div className="login-panel">
    <h1>Login</h1>
    <div className="login-intro">
      <p>Login with your discord account to be able to send reports and much more</p>
    </div>
    <a
    className="login-btn"
    href="/auth/discord"
    rel="nofollow"
    >
      <img
      alt="Discord logo"
      src={dcLogo}
      ></img>
      Login with Discord
    </a>
  </div>

}

const LoginButton = ({ userInfo }) => {
  const [isPanelVisible, setPanelVisible] = useState(0);

  const onLoginButtonClick = () => {
    setPanelVisible(!isPanelVisible);
  }

  return (
    <div className="login-btn-wrapper">
      <div
      className={`sidebar-icon login-panel-btn`}
      alt={!!userInfo ? "User Profile" : "Log in"}
      onClick={onLoginButtonClick}
      >
        <img
        alt={!!userInfo ? "User Avatar" : "Default avatar"}
        src={!!userInfo
          ? userInfo.avatarURL || defaultUserWebp
          : defaultUserWebp
        }
        onError={(e) => { e.target.onerror = null; e.target.src = defaultUserPng }}
        >
        </img>
      </div>
      <LoginPanel isVisible={isPanelVisible} userInfo={userInfo}/>
    </div>
  )
}

function Sidebar() {
  const { store, dispatch } = useContext(RootContext);
  const { userInfo } = useContext(UserContext);
  const { activeTools } = store;

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
        <LoginButton userInfo={userInfo} />
      </div>
    </div>
  )
}

export default Sidebar;
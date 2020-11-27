import { Fragment, useCallback, useContext, useState } from "react";

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

import userWebp from "../img/user.webp";
import userPng from "../img/user.png";

import defaultUserWebp from "../img/dc_default_avatar.webp";
import defaultUserPng from "../img/dc_default_avatar.png";

import { RootContext, UserContext } from "../context";
import { setPanelVisibility } from "../actions";
import { Tools } from "../constants";

import dcLogo from "../img/dc_logo_white.png";

const LoginPanel = ({ isVisible, userInfo }) => {
  if (!isVisible) {
    return null;
  }

  const Panel =
    !!userInfo
      ? (
        <Fragment>
          <h1 className="atlas-title">Profile</h1>
          <p>Welcome {userInfo.tag.substr(0, userInfo.tag.length-5)}</p>
          <a
            className="login-btn"
            alt="Logout session"
            href="/logout/discord"
            >
            <img
            alt="Logout button"
            src={logoutWebp}
            onError={(e) => { e.target.onerror = null; e.target.src = logoutPng }}
            >
            </img>
            Log out
          </a>
        </Fragment>
      )
      : (
        <Fragment>
          <h1 className="atlas-title">Login</h1>
          <div className="login-intro">
            <p>Login to be able to send reports and have access to more features in the future.</p>
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
            Log in with Discord
          </a>
        </Fragment>
      )

  return <div className="login-panel">
    {Panel}
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
          : userWebp
        }
        onError={(e) => { e.target.onerror = null; e.target.src = userPng }}
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
        <LoginButton userInfo={userInfo} />
      </div>
    </div>
  )
}

export default Sidebar;
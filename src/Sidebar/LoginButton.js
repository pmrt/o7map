
import logoutWebp from "../img/logout.webp";
import logoutPng from "../img/logout.png";

import userWebp from "../img/user.webp";
import userPng from "../img/user.png";

import defaultUserWebp from "../img/dc_default_avatar.webp";
// import defaultUserPng from "../img/dc_default_avatar.png";

import { Fragment, useState } from "react";

import dcLogo from "../img/dc_logo_white.png";
import "./LoginButton.css";

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

export default LoginButton;
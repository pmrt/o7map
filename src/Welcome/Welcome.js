import { useContext } from "react";
import { setShowWelcome } from "../actions";
import { RootContext } from "../context";
import "./Welcome.css";

import logoWebp from "../img/logo.webp";
import logoPng from "../img/logo.png";

function Welcome() {
  const { dispatch, store } = useContext(RootContext);
  const { showWelcome } = store;

  const onCloseClick = () => {
    dispatch(setShowWelcome(0));
  }

  if (!showWelcome) {
    return null;
  }

  return (
    <div className="on-boarding">
      <div className="welcome-title">
        <div class="welcome-big-title">
          <img
            class="logo"
            alt="o7map logo"
            src={logoWebp}
            onError={(e) => { e.target.onerror = null; e.target.src = logoPng }}
          ></img>
          <h1>Welcome to o7map</h1>
        </div>
        <h2><em>The collaborative Map for Eve Echoes</em></h2>
        <div className="cross-close-btn" onClick={onCloseClick}></div>
      </div>
      <div className="separator"></div>
      <div className="hints">
        <h3>Psst, here are some hints you may find useful!</h3>
        <ul>
          <li>This map is only for Eve Echoes. Please don't submit reports for
            Eve Online here.</li>
          <li>Reports will show on the map as circles with different sizes and colors depending
            on the number of votes. Reports have a limited duration that can vary over time.
          </li>
          <li>Sending a report is quite straightforward: Open the search tool
            (click the magnifier icon on the sidebar or just press <span className="keybind">S</span>) and type the
            name of the system. Alternatively, you can navigate through the map and click
            on the system. You don't need to be logged in to see the reports but you do need
            it to send them.</li>
          <li>All you need for login in is a Discord account.</li>
        </ul>
      </div>
    </div>
  )
}

export default Welcome;
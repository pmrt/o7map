import { useCallback, useReducer, useRef, useState } from "react";

import './App.css';
import { RootContext, UserContext } from "./context";
import rootReducer, { getInitialState } from "./reducers";
import { addStdoutLine } from "./actions";

import { version } from "../package.json";

import Commander from "./cmd";

import Sidebar from "./Sidebar";
import EchoesMap from "./EchoesMap";
import MapInfo from "./MapInfo";
import Tools from "./Tools";
import Map from "./EchoesMap/canvas/map";
import TopBar from "./TopBar";
import { getUser } from "./helpers";
import Welcome from "./Welcome";
import InlineFeedback from "./InlineFeedback";

const MobileOverlay = () => {
  const [status, setStatus] = useState(null);

  const onSendResponse = useCallback(res => {
    let msg =
      res.code === 200
        ? "You will receive an email when ready"
        : "Couldn't set up reminder";
    setStatus({ message: msg, code: res.code });
  }, []);
  return (
    <div className="mobile-notice">
      <div className="mobile-notice-message">
        <p>Mobile support is in development. Please visit the Desktop site in the meantime. Thank you for your patience.</p>
      </div>
      <div className="mobile-notice-sub">
        <InlineFeedback
          description="When ready, send an email to"
          placeholder="hi@example.com"
          type="mobile_sup_email"
          className="mobile-newsletter"
          buttonText="Notify me"
          onSendResponse={onSendResponse}
        />
        <p className="mobile-notice-sub-status">{!!status && !!status.message ? status.message : ""}</p>
      </div>
    </div>
  )
}

let firstTime = true;
function App() {
  const [state, dispatch] = useReducer(rootReducer, getInitialState());

  if (firstTime) {
    dispatch(addStdoutLine([
      `Echoes Atlas v${version} - Created by Kalad`,
      `Starting system...`
    ], "system"));
    firstTime = false;
  }

  const userInfo = getUser();
  const mapRef = useRef(new Map());
  const cmdRef = useRef(new Commander(dispatch, mapRef));
  const forceReportUpdateRef = useRef(null);

  return (
    <div className="App">
      <UserContext.Provider value={{ userInfo }}>
        <RootContext.Provider value={{ store: state, dispatch, cmdRef, mapRef, forceReportUpdateRef }}>
          <MobileOverlay />
          <TopBar />
          <Sidebar />
          <Welcome />
          <div className="content">
            <Tools />
            <EchoesMap />
            <MapInfo />
          </div>
        </RootContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;

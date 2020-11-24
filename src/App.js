import { useReducer, useRef } from "react";

import './App.css';
import { RootDispatch } from "./context";
import rootReducer, { getInitialState } from "./reducers";
import { addStdoutLine } from "./actions";

import { version } from "../package.json";

import Commander from "./cmd";

import Sidebar from "./Sidebar";
import EchoesMap from "./EchoesMap";
import MapInfo from "./MapInfo";
import Tools from "./Tools";
import Map from "./EchoesMap/canvas/map";
import { getUser } from "./helpers";

let firstTime = true;
function App() {
  const [state, dispatch] = useReducer(rootReducer, getInitialState());

  if (firstTime) {
    dispatch(addStdoutLine(`Echoes Atlas v${version} - Created by Kalad`, "system"));
    dispatch(addStdoutLine(`Starting system...`, "system"));
    firstTime = false;
  }

  const userInfo = getUser();
  const mapRef = useRef(new Map());
  const cmdRef = useRef(new Commander(dispatch, mapRef));
  const forceReportUpdateRef = useRef(null);

  return (
    <div className="App">
      <RootDispatch.Provider value={dispatch}>
        <Sidebar
          activeTools={state.activeTools}
          userInfo={userInfo}
        />
        <div className="content">
          <Tools
            activeTools={state.activeTools}
            stdout={state.stdout}
            activeTabsNames={state.activeTabsNames}
            cmdRef={cmdRef}
            mapRef={mapRef}
            forceReportUpdateRef={forceReportUpdateRef}
            currentMap={state.currentMap}
            isDevMode={state.isDevMode}
            systemDetails={state.details.system}
            userInfo={userInfo}
          />
          <EchoesMap
            isDevMode={state.isDevMode}
            isLoading={state.isLoading}
            mapRef={mapRef}
            forceReportUpdateRef={forceReportUpdateRef}
            fontSize={state.fontSize}
            currentMap={state.currentMap}
          />
          <MapInfo
            currentMap={state.currentMap}
            isLoading={state.isLoading}
            isDevMode={state.isDevMode}
            isReceivingReports={state.isReceivingReports}
            clickedCoords={state.clickedCoords}
            cmdRef={cmdRef}
          />
        </div>
      </RootDispatch.Provider>
    </div>
  );
}

export default App;

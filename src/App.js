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

let firstTime = true;
function App() {
  const [state, dispatch] = useReducer(rootReducer, getInitialState());

  if (firstTime) {
    dispatch(addStdoutLine(`Echoes Atlas v${version} - Created by Kalad`, "system"));
    dispatch(addStdoutLine(`Starting system...`, "system"));
    firstTime = false;
  }

  const mapRef = useRef(new Map());
  const cmdRef = useRef(new Commander(dispatch, mapRef));

  return (
    <div className="App">
      <RootDispatch.Provider value={dispatch}>
        <Sidebar
          activeTools={state.activeTools}
        />
        <div className="content">
          <Tools
            activeTools={state.activeTools}
            stdout={state.stdout}
            activeTabsNames={state.activeTabsNames}
            cmdRef={cmdRef}
            mapRef={mapRef}
            currentMap={state.currentMap}
          />
          <EchoesMap
            isDevMode={state.isDevMode}
            isLoading={state.isLoading}
            mapRef={mapRef}
            fontSize={state.fontSize}
          />
          <MapInfo
            currentMap={state.currentMap}
            isLoading={state.isLoading}
            isDevMode={state.isDevMode}
            clickedCoords={state.clickedCoords}
            cmdRef={cmdRef}
          />
        </div>
      </RootDispatch.Provider>
    </div>
  );
}

export default App;

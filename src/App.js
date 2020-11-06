import { useReducer } from "react";

import './App.css';
import { RootDispatch } from "./context";
import rootReducer, { getInitialState } from "./reducers";
import { addStdoutLine } from "./actions";

import { version } from "../package.json";

import Sidebar from "./Sidebar";
import EchoesMap from "./EchoesMap";
import MapInfo from "./MapInfo";
import Tools from "./Tools";

let firstTime = true;
function App() {
  const [state, dispatch] = useReducer(rootReducer, getInitialState());

  if (firstTime) {
    dispatch(addStdoutLine(`Echoes Atlas v${version} - Created by Kalad`, "system"));
    dispatch(addStdoutLine(`Starting system...`, "system"));
    firstTime = false;
  }

  return (
    <div className="App">
      <RootDispatch.Provider value={dispatch}>
        <Sidebar
          activeTools={state.activeTools}
        />
        <Tools
          activeTools={state.activeTools}
          stdout={state.stdout}
          activeTabsNames={state.activeTabsNames}
        />
        <EchoesMap
          fontSize={state.fontSize}
        />
        <MapInfo
          currentMap={state.currentMap}
          isLoading={state.isLoading}
        />
      </RootDispatch.Provider>
    </div>
  );
}

export default App;

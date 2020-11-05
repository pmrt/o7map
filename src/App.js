import { useReducer } from "react";

import './App.css';
import EchoesMap from "./EchoesMap"
import { RootDispatch } from "./context";
import rootReducer, { getInitialState } from "./reducers";
import Sidebar from "./Sidebar";
import { addStdoutLine } from "./actions";

import { version } from "../package.json";
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
      </RootDispatch.Provider>
    </div>
  );
}

export default App;

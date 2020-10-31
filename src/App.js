import { useReducer } from "react";

import './App.css';
import EchoesMap from "./EchoesMap"
import { RootDispatch } from "./context";
import rootReducer, { getInitialState } from "./reducers";
import Controls from "./Controls/Controls";
import Sidebar from "./Sidebar";
import { addStdoutLine } from "./actions";

import { version } from "../package.json";

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
        <Sidebar />
        <Controls stdout={state.stdout}/>
        <EchoesMap />
      </RootDispatch.Provider>
    </div>
  );
}

export default App;

import { useReducer } from "react";

import './App.css';
import EchoesMap from "./EchoesMap"
import { RootDispatch } from "./context";
import rootReducer, { initialState } from "./reducers";
import Controls from "./Controls/Controls";
import Sidebar from "./Sidebar";

function App() {
  const [state, dispatch] = useReducer(rootReducer, initialState);
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

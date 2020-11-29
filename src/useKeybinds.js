import { useContext, useEffect } from "react";
import { setPanelVisibility } from "./actions";
import { Tools } from "./constants";
import { RootContext } from "./context";

function useKeybinds() {
  const { store, dispatch } = useContext(RootContext);
  const { activeTools } = store;

  const isSearchVisible = activeTools[Tools.SEARCH];
  useEffect(() => {
    const onKeyUp = (e) => {
      switch (e.key) {
        case "s":
          if (!isSearchVisible) {
            dispatch(setPanelVisibility(Tools.SEARCH, 1));
          }
          break;
        default:
      }
    }

    const l = window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", l);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchVisible]);
}

export default useKeybinds;
import { useContext, useEffect } from "react";
import { setPanelVisibility } from "./actions";
import { Tools } from "./constants";
import { RootContext } from "./context";

function useKeybinds() {
  const { store, dispatch } = useContext(RootContext);
  const { activeTools } = store;

  const isSearchVisible = activeTools[Tools.SEARCH];
  useEffect(() => {
    const onKeyDown = e => {
      switch (e.key) {
        case "S":
          if (e.shiftKey) {
              if (!isSearchVisible) {
                dispatch(setPanelVisibility(Tools.SEARCH, 1));
              }
            e.preventDefault();
            return;
          }
          break;
        default:
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchVisible]);
}

export default useKeybinds;
import { useRef, useEffect, useContext, useCallback } from "react";

import { debounce } from "./helpers";
import Map from "./canvas/map";
import theme from "./canvas/theme";
import "./Map.css";
import useFabric from "./useFabric";
import { RootDispatch } from "../context";
import { addStdoutLine } from "../actions";

const MARGIN = 20;

function EchoesMap({ fontSize }) {
  const dispatch = useContext(RootDispatch);
  const log = useCallback((str, lvl="info") => {
    dispatch(addStdoutLine(str, lvl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapRef = useRef(null);
  const fabricRef = useRef(null);
  const fabricCbRef = useFabric(fabricRef, {
    width: window.innerWidth - MARGIN,
    height: window.innerHeight - MARGIN,
    selectable: false,
    hasControls: false,
    backgroundColor: theme.background,
    hoverCursor: 'default',
  });

  useEffect(() => {
    if (!fabricRef.current || mapRef.current) {
      return;
    }

    let didCancel = false;
    const createMap = async() => {
      log(":: Initiating map generation");
      const map = new Map(fabricRef.current, log, {
        fontSize,
      });

      try {
        let start, end;

        log(":: Fetching map data");
        start = performance.now();
        await map.fetchMaps();
        end = performance.now();
        log(`Finished task: map data. Took ${Math.ceil(end - start)}ms.`);

        if (didCancel) {
          return;
        }

        log(":: Setting up map");
        start = performance.now();
        await map.setup();
        end = performance.now();
        log(`Finished task: Setup. Took ${Math.ceil(end - start)}ms.`);

        log(":: Setting up additional event listeners");
        start = performance.now();
        map.on("render:region", (data) => {
          console.log(data);
        });
        end = performance.now();
        log(`Finished task: Additional setup. Took ${Math.ceil(end - start)}ms.`);

        map.drawUniverse();
      } catch (err) {
        log("ERR: " + err.message, "error");
        console.error(err);
        return;
      }

      mapRef.current = map;
    }
    createMap();

    return () => {
      didCancel = true;

      if (mapRef.current) {
        // Remove all event listeners
        mapRef.current.off();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onWinResize = () => {
      log(":: Detected window size change");
      const map = mapRef.current;
      if (map) {
        map.updateDimensions(window.innerWidth - MARGIN, window.innerHeight - MARGIN);
        log("Updated dimensions.");

        try {
          log(":: Repositioning regions");
          const start = performance.now();
          map.center();
          const end = performance.now();
          log(`Finished task: Rendering. Took ${Math.ceil(end - start)}ms.`);
        } catch (err) {
          log("ERR: " + err.message, "error");
          console.error(err);
          return;
        }
      }
    }

    log(":: Setting up dimension listener");
    const optimizedOnWinResize = debounce(onWinResize, 100)
    window.addEventListener("resize", optimizedOnWinResize);
    return () => {
      log(":: Removing up dimension listener");
      window.removeEventListener("resize", optimizedOnWinResize);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;
    log(":: Setting fontSize");
    map.setFontSize(fontSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSize]);

  return (
    <div className="echoes-map">
      <canvas ref={fabricCbRef}>
        You need to enable canvas support to run this app.
      </canvas>
    </div>
  )
}

export default EchoesMap;
import { useRef, useEffect, useState, useContext } from "react";

import { debounce } from "./helpers";
import Map from "./canvas/map";
import theme from "./canvas/theme";
import "./Map.css";
import useFabric from "./useFabric";
import { RootDispatch } from "../context";
import { addStdoutLine } from "../actions";

const MARGIN = 20;

function EchoesMap() {
  const dispatch = useContext(RootDispatch);
  const log = (str) => {
    dispatch(addStdoutLine(str));
  }

  const [error, setErr] = useState(null);

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
      const map = new Map(fabricRef.current);

      try {
        let start, end;

        log(":: Fetching map data");
        start = performance.now();
        await map.fetchMaps();
        end = performance.now();
        log(`Finished task: map data. Took ${end - start}ms.`);

        log(":: Setting up");
        start = performance.now();
        await map.setup();
        end = performance.now();
        log(`Finished task: Setup. Took ${end - start}ms.`);
      } catch (err) {
        setErr(err);
        return;
      }

      if (didCancel) {
        return;
      }

      try {
        log(":: Filling with regions");
        const start = performance.now();
        map.fillRegions();
        const end = performance.now();
        log(`Finished task: Rendering. Took ${end - start}ms.`);
      } catch (err) {
        setErr(err);
        return;
      }

      mapRef.current = map;
    }
    createMap();

    return () => didCancel = true;
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
          map.centerRegions();
          const end = performance.now();
          log(`Finished task: Rendering. Took ${end - start}ms.`);
        } catch (err) {
          setErr(err);
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

  if (error) {
   return (
    <div className="error">
      {error.message}
    </div>
   )
  }

  return (
    <div className="echoes-map">
      <canvas ref={fabricCbRef}>
        You need to enable canvas support to run this app.
      </canvas>
    </div>
  )
}

export default EchoesMap;
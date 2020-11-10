import { useRef, useEffect, useContext, useCallback, Fragment } from "react";

import { debounce } from "./helpers";
import Map from "./canvas/map";
import theme from "./canvas/theme";
import "./Map.css";
import useFabric from "./useFabric";
import { RootDispatch } from "../context";
import { addStdoutLine, setClickedCoords, setCurrentMap, setIsLoading } from "../actions";

const MARGIN = 20;

function EchoesMap({ fontSize, mapRef, isDevMode, isLoading }) {
  const dispatch = useContext(RootDispatch);
  const log = useCallback((str, lvl="info") => {
    dispatch(addStdoutLine(str, lvl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSetIsLoading = useCallback((isLoading) => {
    dispatch(setIsLoading(isLoading));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const map = new Map(fabricRef.current, log, onSetIsLoading, {
        fontSize,
      });

      try {

        if (didCancel) {
          return;
        }

        let start, end;
        log(":: Setting up map");
        start = performance.now();
        await map.setup();
        end = performance.now();
        log(`Finished task: Setup. Took ${Math.ceil(end - start)}ms.`);

        log(":: Setting up additional event listeners");
        start = performance.now();
        map.on("render:region", (data) => {
          const { rid, rn, avgSec } = data;
          dispatch(setCurrentMap(rid, rn, avgSec))
        });
        map.on("render:universe", () => {
          dispatch(setCurrentMap("", "", ""))
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
        mapRef.current.cleanup();
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
    const map = mapRef.current;
    if (!map) {
      return;
    }

    log(":: Setting fontSize");
    map.setFontSize(fontSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSize]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const onReceiveCoords = coords => {
      dispatch(setClickedCoords(coords));
    }

    map.on("mousedown:pointer", onReceiveCoords);
    return () => {
      map.off("mousedown:pointer", onReceiveCoords);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevMode]);

  return (
    <Fragment>
    <LoadingOverlay isLoading={isLoading}/>
    <div className="echoes-map">
      <canvas ref={fabricCbRef}>
        You need to enable canvas support to run this app.
      </canvas>
    </div>
    </Fragment>
  )
}

const quotes = [
  { str: "I'm leaving the game, first one to accept the contract takes all my isk", author: "A trustworthy person in Jita"},
  { str: "You can't say bubbles angrily.", author: "Not an EVE player"},
  { str: "Right now, someone, somewhere, is doing something stupid in a shiny ship... find them.", author: "u/Drefizzles_alt"},
  { str: "I didn't want that ship anyway.", author: "u/Drefizzles_alt"},
  { str: "PvP is hard, but trying to send a PM in Echoes is on a whole different level", author: "Kalad"},
  { str: "Bluestacks is life, bluestacks is love.", author: "Unknown" },
  { str: "Reconnecting...", author: "Eve Echoes, the game"},
];

function pick(arr) {
  return arr[Math.random() * arr.length >> 0];
}

const quote = pick(quotes);

let areQuotesVisible = true;
function LoadingOverlay({ isLoading }) {
  useEffect(() => {
    setTimeout(() => {
      areQuotesVisible = false;
    }, 4e3);
  }, []);

  const Loader = areQuotesVisible
    ? (
      <div className="quote">
        <p className="loading-quote">&lt;&lt; {quote.str} &gt;&gt;</p>
        <p className="quote-author">— {quote.author}</p>
      </div>
    )
    : (
      <p className="loading-text">Loading...</p>
    )

  return (
    <div className="map-loading-overlay" style={{ opacity: isLoading ? "1" : "0"}}>
      <div className="map-loading-message">
        { Loader }
      </div>
    </div>
  )
}

export default EchoesMap;
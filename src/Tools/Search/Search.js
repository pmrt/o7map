import { Fragment, useContext, useEffect, useMemo, useReducer, useRef } from "react";

import { addStdoutLine } from "../../actions";
import { RootDispatch } from "../../context";
import { MapType } from "../../EchoesMap/canvas/consts";
import { debounce } from "../../EchoesMap/helpers";

import Panel from "../../Panel";
import Table from "../../Table";

import searchWebp from "../../img/search.webp";
import searchPng from "../../img/search.png";

import "./Search.css";

function useAutofocus(ref) {
  useEffect(() => {
    const input = ref.current;
    if (!input) {
      return;
    }
    input.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useAutoSelection(ref) {
  useEffect(() => {
    const onFocus = () => {
      const input = ref.current;
      if (!input) {
        return;
      }
      input.setSelectionRange(0, input.value.length);
    }

    const input = ref.current;
    if (!input) {
      return;
    }
    input.addEventListener("focus", onFocus);

    return () => {
      input.removeEventListener("focus", onFocus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function SearchTabs ({
  tabTitles,
  selected,
  customActiveTabClassName,
  onTabClicked
}) {
  const titles = Object.keys(tabTitles);
  return (
    <Fragment>
      {titles.map(title => {
        const tabInfo = tabTitles[title];
        const activeComp = tabInfo[0];
        const len = tabInfo[1];
        const lenStr =
          len > 0
            ? ` (${len})`
            : "";

        const isActive =
          // if tabTitles has only 1 element, don't show active state
          titles.length > 1 &&
          selected === activeComp.name;
        return (
          <h3
          key={title}
          className={isActive ? customActiveTabClassName : ""}
          onClick={() => onTabClicked(activeComp.name)}
        >{title}<span>{lenStr}</span></h3>
        )
      })}
    </Fragment>
  )
};

const regionCols = [
  {
    Header: "name",
    accessor: "n",
  },
  {
    Header: "avg_sec",
    accessor: row => row.sec.str,
  },
  {
    Header: "max_sec",
    accessor: row => row.sec.max,
  },
  {
    Header: "min_sec",
    accessor: row => row.sec.min,
  },
  {
    Header: "systems",
    accessor: row => row.sys.length,
  },
];

const systemCols = [
  {
    Header: "name",
    accessor: "n",
  },
  {
    Header: "sec",
    accessor: row => row.sec.str,
  },
  {
    Header: "const",
    accessor: row => row.cn.n,
  },
  {
    Header: "region",
    accessor: row => row.rg.n,
  },
  {
    Header: "stations",
    accessor: "st",
  }
]

function SearchResultList({ columns, results, onRowClick }) {
  return (
    <Table
      columns={columns}
      data={results}
      height={195}
      rowSize={20}
      columnWidth={80}
      cellLimit={8}
      width={480}
      onRowClick={onRowClick}
    />
  )
}

const EmptyResults = ({ message = "No results found" }) => {
  return (
  <div className="empty">
      <img
      alt="Search anything"
      src={searchWebp}
      onError={(e) => { e.target.onerror = null; e.target.src = searchPng }}
      ></img>
    <p>{ message }</p>
  </div>
  )
}

function Systems({ systemResults, onSystemClick }) {
  const [searchId, systems] = systemResults;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => systems, [searchId]);

  if (systemResults.length === 0 || results.length === 0) {
    return (
      <EmptyResults
        message={"No systems found"}
      />
    )
  }

  return (
    <SearchResultList
      columns={systemCols}
      results={results}
      onRowClick={onSystemClick}
    />
  );
}

function Regions({ regionResults, onRegionClick }) {
  const [searchId, regions] = regionResults;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => regions, [searchId]);

  if (regionResults.length === 0 || results.length === 0) {
    return (
      <EmptyResults
        message={"No regions found"}
      />
    )
  }

  return (
    <SearchResultList
      columns={regionCols}
      results={results}
      onRowClick={onRegionClick}
    />
  );
}

function Current({ currentResults, onSystemClick }) {
  const [searchId, current] = currentResults;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => current, [searchId]);

  if (currentResults.length === 0 || results.length === 0) {
    return (
      <EmptyResults
        message={"Not in a region"}
      />
    )
  }

  return (
    <SearchResultList
      columns={systemCols}
      results={results}
      onRowClick={onSystemClick}
    />
  );
}

const SearchActions = {
  SET_RESULTS: "set_results",
  SET_CURRENT_SYSTEMS: "set_current_systems",
  SET_ACTIVE_TAB: "set_active_tab",
}

function setResults(systemResults, regionResults) {
  return {
    systemResults: systemResults || [],
    regionResults: regionResults || [],
    type: SearchActions.SET_RESULTS,
  }
}

function setCurrentSystems(currentResults) {
  return {
    currentResults: currentResults || [],
    type: SearchActions.SET_CURRENT_SYSTEMS,
  }
}

function setActiveTab(activeTabName) {
  return {
    activeTabName,
    type: SearchActions.SET_ACTIVE_TAB,
  }
}

const initialState = {
  systemResults: [],
  regionResults: [],
  currentResults: [],
  activeTabName: "",
}

const searchReducer = (state, action) => {
  switch (action.type) {
    case SearchActions.SET_RESULTS:
      return {
        ...state,
        systemResults: action.systemResults,
        regionResults: action.regionResults,
      }
    case SearchActions.SET_CURRENT_SYSTEMS:
      return {
        ...state,
        currentResults: action.currentResults,
      }
    case SearchActions.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTabName: action.activeTabName,
      }

    default:
      return initialState;
  }
}

function Search({ mapRef, currentMap }) {
  const rootDispatch = useContext(RootDispatch);
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const inputRef = useRef(null);
  useAutofocus(inputRef);
  useAutoSelection(inputRef);

  const onKeyDown = async (evt) => {
    const val = evt.target.value;
    const map = mapRef.current;
    if (!map || val === "") {
      return;
    }

    let systemResults, regionResults;
    try {
      systemResults = await map.findStartingWith(MapType.SYSTEM, val);
      regionResults = await map.findStartingWith(MapType.REGION, val);
    } catch(err) {
      rootDispatch(addStdoutLine(`ERR: Search error: ${err.name}`), "error");
      console.error(err);
      return;
    }

    dispatch(setResults(systemResults, regionResults));

    // Little UI helpers, if one tab (system or region) has results and
    // the other doesn't, switch to that tab.
    if (systemResults.length > 0 && systemResults[1].length > 0) {
      if (regionResults.length === 0 || regionResults[1].length === 0){
        dispatch(setActiveTab("Systems"));
      }
    }

    if (regionResults.length > 0 && regionResults[1].length > 0) {
      if (systemResults.length === 0 || systemResults[1].length === 0){
        dispatch(setActiveTab("Regions"));
      }
    }
  }

  const onSystemClick = (row) => {
    const sysName = row.original.n;
    if (!sysName) {
      return;
    }

    const region = row.original.rg;
    if (!region) {
      return;
    }
    const regionName = region.n;

    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.goTo(regionName, sysName);
  }

  const onRegionClick = (row) => {
    const rgName = row.original.n;
    if (!rgName) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.goTo(rgName);
  }

  const onTabClick = title => {
    dispatch(setActiveTab(title));
  }

  const optimizedOnKeyDown = debounce(onKeyDown, 250);

  useEffect(() => {
    let didCancel = false;

    async function getCurrentSystems() {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      const currentResults = await map.getCurrentSystems();
      if (!didCancel) {
        dispatch(setCurrentSystems(currentResults));
      }
    }

    getCurrentSystems();

    return () =>{
     didCancel = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const onRegionRender = async ({ rid }) => {
      const currentResults = await map.getSystemsInRegion(rid);
      dispatch(setCurrentSystems(currentResults));
    };
    map.on("render:region", onRegionRender)

    const onUniverseRender = async () => {
      dispatch(setCurrentSystems([]));
    };
    map.on("render:universe", onUniverseRender)

    return () => {
      map.off("render:region", onRegionRender);
      map.off("render:universe", onUniverseRender);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const map = mapRef.current;

  const defaultPanel =
    map && map.getCurrentMapType() === MapType.REGION
    ? Current
    : Systems;

  const { systemResults, regionResults, currentResults } = state;

  let lenSys = 0;
  if (systemResults.length > 0) {
    lenSys = systemResults[1].length;
  }

  let lenRg = 0;
  if (regionResults.length > 0) {
    lenRg = regionResults[1].length;
  }

  let lenCur = 0;
  if (currentResults.length > 0) {
    lenCur = currentResults[1].length;
  }
  return (
    <div className="search">
      <div className="input-wrapper">
          <input
          className="search-input"
          type="text"
          onKeyDown={optimizedOnKeyDown}
          placeholder="Search anything..."
          ref={inputRef}
          ></input>
      </div>
      <div className="search-results">
        <Panel
          defaultPanel={defaultPanel}
          isDraggable={false}
          selectedPanelName={state.activeTabName}
          onTabClick={onTabClick}
          customParentClassNames={"panels2"}
          customParentWrapperClassName={"search-panel"}
          customCloseBtnClassName={"close-btn2"}
          customTopbarClassNames={"topbar2"}
          CustomTabs={SearchTabs}
          tabTitles={{
            "All Systems": [Systems, lenSys],
            "All Regions": [Regions, lenRg],
            "Current Systems": [Current, lenCur],
          }}
        >
          <Systems systemResults={systemResults} onSystemClick={onSystemClick}/>
          <Regions regionResults={regionResults} onRegionClick={onRegionClick}/>
          <Current currentResults={currentResults} onSystemClick={onSystemClick}/>
        </Panel>
      </div>
    </div>
  );
}

export default Search;
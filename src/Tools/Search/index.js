import { useContext } from "react";

import { setPanelVisibility } from "../../actions";
import { Tools } from "../../constants";

import { RootDispatch } from "../../context";

import Panel from "../../Panel";
import Search from "./Search";


function SearchPanel({ mapRef, currentMap, forceReportUpdateRef }) {
  const dispatch = useContext(RootDispatch);

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.SEARCH, 0));
  }

  return (
    <Panel
      defaultPanelKey="search"
      tabTitles={{ "Search": "search" }}
      onCloseClick={onCloseClick}
      customTopbarClassNames={"topbar dark-topbar"}
    >
      <Search
      tabKey="search"
      mapRef={mapRef}
      currentMap={currentMap}
      forceReportUpdateRef={forceReportUpdateRef}/>
    </Panel>
  )
}

export default SearchPanel;
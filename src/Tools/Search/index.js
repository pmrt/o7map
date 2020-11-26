import { useContext } from "react";

import { setPanelVisibility } from "../../actions";
import { Tools } from "../../constants";

import { RootContext } from "../../context";

import Panel from "../../Panel";
import Search from "./Search";


function SearchPanel({ mapRef, currentMap, forceReportUpdateRef, isVisible }) {
  const { dispatch } = useContext(RootContext);

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.SEARCH, 0));
  }

  return (
    <Panel
      defaultPanelKey="search"
      tabTitles={{ "Search": "search" }}
      onCloseClick={onCloseClick}
      customTitlebarClassNames={"titlebar dark-titlebar"}
      isVisible={isVisible}
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
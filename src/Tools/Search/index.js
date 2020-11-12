import { useContext } from "react";

import { setPanelVisibility } from "../../actions";
import { Tools } from "../../constants";

import { RootDispatch } from "../../context";

import Panel from "../../Panel";
import Search from "./Search";


function SearchPanel({ mapRef, currentMap }) {
  const dispatch = useContext(RootDispatch);

  const onCloseClick = () => {
    dispatch(setPanelVisibility(Tools.SEARCH, 0));
  }

  return (
    <Panel
      defaultPanel={Search}
      defaultPosition={{x: 20, y: 380}}
      tabTitles={{ "Search": Search }}
      onCloseClick={onCloseClick}
      customTopbarClassNames={"topbar dark-topbar"}
    >
      <Search mapRef={mapRef} currentMap={currentMap}/>
    </Panel>
  )
}

export default SearchPanel;
import { Fragment } from "react";
import { Tools as ToolTypes } from "../constants";

import SearchPanel from "./Search";
import SettingsPanel from "./Settings";

import "./Tools.css"

function Tools({
  stdout,
  activeTabsNames,
  activeTools,
  cmdRef,
  mapRef,
  currentMap,
}) {
  return (
    <Fragment>
      {!!activeTools[ToolTypes.SETTINGS] &&
      <SettingsPanel
        stdout={stdout}
        activeTab={activeTabsNames[ToolTypes.SETTINGS]}
        cmdRef={cmdRef}
      />}

      {!!activeTools[ToolTypes.SEARCH] &&
      <SearchPanel
        mapRef={mapRef}
        currentMap={currentMap}
      />}
    </Fragment>
  )
}

export default Tools;
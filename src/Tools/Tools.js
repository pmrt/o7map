import { Fragment } from "react";
import { Tools as ToolTypes } from "../constants";

import SearchPanel from "./Search";
import SettingsPanel from "./Settings";
import SystemDetailsPanel from "./SystemDetails";

import "./Tools.css"

function Tools({
  stdout,
  activeTabsNames,
  activeTools,
  cmdRef,
  mapRef,
  forceReportUpdateRef,
  currentMap,
  isDevMode,
  systemDetails,
  userInfo,
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

      {!!activeTools[ToolTypes.SYSTEM_DETAILS] &&
      <SystemDetailsPanel
        isDevMode={isDevMode}
        system={systemDetails}
        mapRef={mapRef}
        forceReportUpdateRef={forceReportUpdateRef}
        userInfo={userInfo}
      />}
    </Fragment>
  )
}

export default Tools;
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
      <SettingsPanel
        stdout={stdout}
        activeTab={activeTabsNames[ToolTypes.SETTINGS]}
        cmdRef={cmdRef}
        isVisible={!!activeTools[ToolTypes.SETTINGS]}
      />

      <SearchPanel
        mapRef={mapRef}
        currentMap={currentMap}
        isVisible={!!activeTools[ToolTypes.SEARCH]}
      />

      <SystemDetailsPanel
        isDevMode={isDevMode}
        system={systemDetails}
        mapRef={mapRef}
        forceReportUpdateRef={forceReportUpdateRef}
        userInfo={userInfo}
        isVisible={!!activeTools[ToolTypes.SYSTEM_DETAILS]}
      />
    </Fragment>
  )
}

export default Tools;
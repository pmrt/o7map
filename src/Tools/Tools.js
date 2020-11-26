import { Fragment, useContext } from "react";
import { Tools as ToolTypes } from "../constants";
import { RootContext } from "../context";

import SearchPanel from "./Search";
import SettingsPanel from "./Settings";
import SystemDetailsPanel from "./SystemDetails";

import "./Tools.css"

function Tools() {
  const { store } = useContext(RootContext);
  const { activeTools, activeTabsNames } = store;
  return (
    <Fragment>
      <SettingsPanel
        activeTab={activeTabsNames[ToolTypes.SETTINGS]}
        isVisible={!!activeTools[ToolTypes.SETTINGS]}
      />

      <SearchPanel
        isVisible={!!activeTools[ToolTypes.SEARCH]}
      />

      <SystemDetailsPanel
        isVisible={!!activeTools[ToolTypes.SYSTEM_DETAILS]}
      />
    </Fragment>
  )
}

export default Tools;
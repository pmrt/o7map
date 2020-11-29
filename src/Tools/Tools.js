import { Fragment, useContext } from "react";
import { Tools as ToolTypes } from "../constants";
import { RootContext } from "../context";

import SearchPanel from "./Search";
import SettingsPanel from "./Settings";
import SystemDetailsPanel from "./SystemDetails";
import FeedbackPanel from "./Feedback";
import AboutPanel from "./About";

import "./Tools.css"
import useKeybinds from "../useKeybinds";

function Tools() {
  const { store } = useContext(RootContext);
  const { activeTools, activeTabsNames } = store;

  useKeybinds();
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

      <FeedbackPanel
       isVisible={!!activeTools[ToolTypes.FEEDBACK]}
      />

      <AboutPanel
        isVisible={!!activeTools[ToolTypes.ABOUT]}
      />
    </Fragment>
  )
}

export default Tools;
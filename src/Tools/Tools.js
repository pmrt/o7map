import { Tools as ToolTypes } from "../constants";

import SettingsPanel from "./Settings";
import "./Tools.css"

function Tools({ stdout, activeTabsNames, activeTools, cmdRef }) {
  return (
    !!activeTools[ToolTypes.SETTINGS] &&
    <SettingsPanel
      stdout={stdout}
      activeTab={activeTabsNames[ToolTypes.SETTINGS]}
      cmdRef={cmdRef}
    />
  )
}

export default Tools;
import { Tools as ToolTypes } from "../constants";

import SettingsPanel from "./Settings";
import "./Tools.css"

function Tools({ stdout, activeTabsNames, activeTools }) {
  return (
    activeTools[ToolTypes.SETTINGS] === true &&
    <SettingsPanel
      stdout={stdout}
      activeTab={activeTabsNames[ToolTypes.SETTINGS]}
    />
  )
}

export default Tools;
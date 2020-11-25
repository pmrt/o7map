import { version } from "../../package.json"

import "./AppInfo.css"

const AppInfo = () => {
  const [vcore, prerelease] = version.split("-");
  return (
  <div className="app-info">
    <p className="version">v{vcore}-{prerelease}</p>
    <p className="version-disclaimer">{prerelease} VERSION</p>
  </div>
)}

export default AppInfo
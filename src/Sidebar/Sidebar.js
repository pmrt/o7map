import "./Sidebar.css"

import addWebp from "../img/add.webp";
import addPng from "../img/add.png";

import filterWebp from "../img/filter.webp";
import filterPng from "../img/filter.png";

import planetWebp from "../img/planet.webp";
import planetPng from "../img/planet.png";

import searchWebp from "../img/search.webp";
import searchPng from "../img/search.png";

import settingsWebp from "../img/settings.webp";
import settingsPng from "../img/settings.png";


function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-icon" alt="Creation tool">
        <img
        alt="Creation tool"
        src={addPng}
        onError={(e) => { e.target.onerror = null; e.target.src = addPng }}
        >
        </img>
      </div>

      <div className="sidebar-icon" alt="Search tool">
        <img
        alt="Search tool"
        src={searchWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = searchPng }}
        >
        </img>
      </div>

      <div className="sidebar-icon" alt="Filter tool">
        <img
        alt="Filter tool"
        src={filterWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = filterPng }}
        >
        </img>
      </div>

      <div className="sidebar-icon" alt="Planet tool">
        <img
        alt="Planet tool"
        src={planetWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = planetPng }}
        >
        </img>
      </div>

      <div className="sidebar-icon" alt="Terminal and Settings">
        <img
        alt="Terminal and Settings"
        src={settingsWebp}
        onError={(e) => { e.target.onerror = null; e.target.src = settingsPng }}
        >
        </img>
      </div>
    </div>
  )
}

export default Sidebar;
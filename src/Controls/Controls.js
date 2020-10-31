import Draggable from 'react-draggable';

import { cloneElement, useState } from 'react';

import Console from "./panels/Console";
import Settings from './panels/Settings';
import "./Controls.css";

function Panel({ defaultPanel, tabTitles, children }) {
  const [SelectedPanelName, setPanelName] = useState(defaultPanel.name);

  const Comp = children.find(comp =>
    comp.type.name === SelectedPanelName
  ) || null;

  return (
    <Draggable
      axis="both"
      handle=".draggable"
      defaultPosition={{x: 50, y: 20}}
      grid={[25, 25]}
      scale={1}
    >
      <div className="controls">
        <div className="topbar draggable">
          {Object.keys(tabTitles).map(title => {
            const activeComp = tabTitles[title];
            const isActive = SelectedPanelName === activeComp.name;
            return (
              <h3
              className={isActive ? "active" : ""}
              onClick={() => setPanelName(title)}
              >{title}</h3>
            )
          })}
        </div>
        <div className="panel">
          {cloneElement(Comp)}
        </div>
      </div>
    </Draggable>
  )
}

function Controls({ stdout }) {
  return (
    <Panel
      defaultPanel={Console}
      tabTitles={{ "Console": Console, "Settings": Settings }}
    >
      <Console stdout={stdout}/>
      <Settings />
    </Panel>
  )
}

export default Controls;
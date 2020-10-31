import Draggable from 'react-draggable';

import { cloneElement, useContext } from 'react';

import Console from "./panels/Console";
import Settings from './panels/Settings';
import "./Controls.css";
import { RootDispatch } from '../context';
import { selectPanelName } from '../actions';

function Panel({ defaultPanel, selectedPanelName, tabTitles, children }) {
  const dispatch = useContext(RootDispatch);

  let selected;
  if (!selectedPanelName) {
    selected = defaultPanel.name;
  } else if (typeof selectedPanelName === "string") {
    selected = selectedPanelName;
  }

  const Comp = children.find(comp =>
    comp.type.name === selected
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
            const isActive = selected === activeComp.name;
            return (
              <h3
              key={title}
              className={isActive ? "active" : ""}
              onClick={() => dispatch(selectPanelName(title))}
              >{title}</h3>
            )
          })}
        </div>
        <div className="panel-wrapper">
          {cloneElement(Comp)}
        </div>
      </div>
    </Draggable>
  )
}

function Controls({ stdout, selectedPanelName }) {
  return (
    <Panel
      defaultPanel={Console}
      selectedPanelName={selectedPanelName}
      tabTitles={{ "Console": Console, "Settings": Settings }}
    >
      <Console stdout={stdout}/>
      <Settings />
    </Panel>
  )
}

export default Controls;
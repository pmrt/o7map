import Draggable from 'react-draggable';

import { cloneElement, useCallback } from 'react';

function Panel({
  defaultPanel,
  selectedPanelName,
  onTabClick = null,
  onCloseClick = null,
  tabTitles,
  children
}) {
  let selected;
  if (!selectedPanelName) {
    selected = defaultPanel.name;
  } else if (typeof selectedPanelName === "string") {
    selected = selectedPanelName;
  }

  const Comp = children.find(comp =>
    comp.type.name === selected
  ) || null;

  const onTabClicked = useCallback((title) => {
    if (!!onTabClick) {
      onTabClick(title);
    }
  }, [onTabClick]);

  const onCloseClicked = useCallback(() => {
    if (!!onCloseClick) {
      onCloseClick();
    }
  }, [onCloseClick]);

  return (
    <Draggable
      bounds="parent"
      axis="both"
      handle=".draggable"
      defaultPosition={{x: 60, y: 20}}
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
              onClick={() => onTabClicked(title)}
              >{title}</h3>
            )
          })}
          <span className="close-btn" onClick={onCloseClicked}></span>
        </div>
        <div className="panel-wrapper">
          {cloneElement(Comp)}
        </div>
      </div>
    </Draggable>
  )
}

export default Panel;
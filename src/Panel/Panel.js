import Draggable from 'react-draggable';

import { cloneElement, Fragment, useRef } from 'react';

function Wrapper({
  isDraggable,
  children,

  customDraggableClassName,
  onMouseDown,
  defaultPosition,
}) {
  return isDraggable
    ? <Draggable
      bounds="parent"
      axis="both"
      handle={`.${customDraggableClassName}`}
      onMouseDown={onMouseDown}
      defaultPosition={defaultPosition}
      grid={[25, 25]}>
      {children}
      </Draggable>
    : <Fragment>
      {children}
    </Fragment>

}

const TabTitles = ({
  tabTitles,
  selected,
  customActiveTabClassName,
  onTabClicked
}) => {
  const titles = Object.keys(tabTitles);
  return (
    <Fragment>
      {titles.map(title => {
        const activeComp = tabTitles[title];
        const isActive =
          // if tabTitles has only 1 element, don't show active state
          titles.length > 1 &&
          selected === activeComp.name;
        return (
          <h3
          key={title}
          className={isActive ? customActiveTabClassName : ""}
          onClick={() => onTabClicked(activeComp.name)}
          >{title}</h3>
        )
      })}
    </Fragment>
  );
};

function Panel({
  defaultPanel,
  defaultPosition = {x: 20, y: 20},
  selectedPanelName,
  customParentClassNames = "panels",
  customParentWrapperClassName = "panel-wrapper",
  customCloseBtnClassName = "close-btn",
  customTopbarClassNames = "topbar",
  customDraggableClassName = "draggable",
  customActiveTabClassName = "active",
  onTabClick = null,
  onCloseClick = null,
  isDraggable = true,
  tabTitles,
  children,
  CustomTabs = null,
}) {
  customTopbarClassNames =
    isDraggable
      ? customTopbarClassNames + ` ${customDraggableClassName}`
      : "topbar";

  let selected;
  if (!selectedPanelName) {
    selected = defaultPanel.name;
  } else if (typeof selectedPanelName === "string") {
    selected = selectedPanelName;
  }

  const Comp = Array.isArray(children)
    ? children.find(comp =>
      comp.type.name === selected
    ) || null
    : children;

  const onTabClicked = (title) => {
    if (!!onTabClick) {
      onTabClick(title);
    }
  };

  const panelRef = useRef(null);
  const onMouseDown = () => {
    const panels = document.getElementsByClassName("panels");
    for (let panel of panels) {
      panel.style.removeProperty("z-index");
    }

    panelRef.current.style.zIndex = "100";
  }

  return (
    <Wrapper
      isDraggable={isDraggable}
      customDraggableClassName={customDraggableClassName}
      onMouseDown={onMouseDown}
      defaultPosition={defaultPosition}
    >
      <div className={customParentClassNames} ref={panelRef}>
        <div className={customTopbarClassNames}>
          {!!CustomTabs
            ? <CustomTabs
              tabTitles={tabTitles}
              selected={selected}
              customActiveTabClassName={customActiveTabClassName}
              onTabClicked={onTabClicked}
              />
            :
              <TabTitles
                tabTitles={tabTitles}
                selected={selected}
                customActiveTabClassName={customActiveTabClassName}
                onTabClicked={onTabClicked}
              />
          }
          {
            !!onCloseClick &&
            <span
            className={customCloseBtnClassName}
            onClick={onCloseClick}></span>
          }
        </div>
        <div className={customParentWrapperClassName}>
          {cloneElement(Comp)}
        </div>
      </div>
    </Wrapper>
  );
}

export default Panel;
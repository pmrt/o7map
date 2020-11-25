import Draggable from 'react-draggable';

import { cloneElement, Fragment, useEffect, useRef } from 'react';

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
        const tabKey = tabTitles[title];
        const isActive =
          // if tabTitles has only 1 element, don't show active state
          titles.length > 1 &&
          selected === tabKey;
        return (
          <h3
          key={title}
          className={isActive ? customActiveTabClassName : ""}
          onClick={() => onTabClicked(tabKey)}
          >{title}</h3>
        )
      })}
    </Fragment>
  );
};

function Panel({
  defaultPanelKey,
  defaultPosition = {x: 20, y: 20},
  selectedPanelName,
  customParentClassNames = "panels",
  customParentWrapperClassName = "panel-wrapper",
  customCloseBtnClassName = "close-btn",
  customTitlebarClassNames = "titlebar",
  customDraggableClassName = "draggable",
  customActiveTabClassName = "active",
  onTabClick = null,
  onCloseClick = null,
  isDraggable = true,
  tabTitles,
  children,
  CustomTabs = null,
}) {
  customTitlebarClassNames =
    isDraggable
      ? customTitlebarClassNames + ` ${customDraggableClassName}`
      : "titlebar";

  let selected = selectedPanelName || defaultPanelKey;

  let Comp;
  if (Array.isArray(children)) {
    Comp = children.find(comp =>
      comp.props.tabKey === selected
    );

    if (!Comp) {
      // In odd situations (e.g. changing a comp tabKey), the state
      // will be stale and Comp will be null, so we just fallback to
      // default, just in case.
      Comp = children.find(comp =>
        comp.props.tabKey === defaultPanelKey
      )
    }
  } else {
    Comp = children;
  }

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

  useEffect(() => {
    // Bring to front on initial render
    panelRef.current.style.zIndex = "100";
  }, [])

  return (
    <Wrapper
      isDraggable={isDraggable}
      customDraggableClassName={customDraggableClassName}
      onMouseDown={onMouseDown}
      defaultPosition={defaultPosition}
    >
      <div className={customParentClassNames} ref={panelRef}>
        <div className={customTitlebarClassNames}>
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
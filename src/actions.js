export const ActionTypes = {
  ADD_STDOUT_LINE: "add_stdout_line",
  SELECT_PANEL_NAME: "select_panel_name",
  SET_PANEL_VISIBILITY: "set_panel_visibility",
  SET_FONT_SIZE: "set_font_size",
  SET_CURRENT_MAP: "set_current_map",
  SET_IS_LOADING: "set_is_loading",
  SET_IS_DEV_MODE: "set_is_dev_mode",
  SET_CLICKED_COORDS: "set_clicked_coords",
  RESET_STATE: "reset_state",
}

export function addStdoutLine(str, level="info") {
  return {
    type: ActionTypes.ADD_STDOUT_LINE,
    ts: Date.now(),
    str,
    level,
  }
}

export function selectTab(tool, selected) {
  return {
    tool,
    selected,
    type: ActionTypes.SELECT_PANEL_NAME,
  }
}

export function setPanelVisibility(tool, visible) {
  return {
    tool,
    visible: visible,
    type: ActionTypes.SET_PANEL_VISIBILITY,
  }
}

export function setIsLoading(isLoading) {
  return {
    isLoading,
    type: ActionTypes.SET_IS_LOADING,
  }
}

export function setFontSize(fontSize) {
  return {
    fontSize,
    type: ActionTypes.SET_FONT_SIZE,
  }
}

export function setCurrentMap(id, name, sec) {
  return {
    id, name, sec,
    type: ActionTypes.SET_CURRENT_MAP,
  }
}

export function setIsDevMode(isDevMode) {
  return {
    isDevMode,
    type: ActionTypes.SET_IS_DEV_MODE,
  }
}

export function setClickedCoords(coords) {
  return {
    coords,
    type: ActionTypes.SET_CLICKED_COORDS,
  }
}

export function resetState() {
  return {
    type: ActionTypes.RESET_STATE,
  }
}
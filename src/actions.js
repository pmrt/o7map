export const ActionTypes = {
  ADD_STDOUT_LINE: "add_stdout_line",
  SELECT_PANEL_NAME: "select_panel_name",
  SET_PANEL_VISIBILITY: "set_panel_visibility",
  SET_FONT_SIZE: "set_font_size",
  SET_CURRENT_MAP: "set_current_map",
  SET_IS_LOADING: "set_is_loading",
  SET_IS_DEV_MODE: "set_is_dev_mode",
  SET_CLICKED_COORDS: "set_clicked_coords",
  SET_SYSTEM_DETAILS: "set_system_details",
  SET_SYSTEM_DETAILS_AND_OPEN: "set_system_details_and_open",
  SET_IS_RECEIVING_REPORTS: "set_is_receiving_reports",
  SET_SHOW_WELCOME: "set_show_welcome",
  RESET_STATE: "reset_state",
}

function id(len) {
  let r = "";
  const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLen = allChars.length;
  for (let i = 0; i < len; i++) {
     r += allChars.charAt(Math.floor(Math.random() * charsLen));
  }
  return r;
}

export function addStdoutLine(strOrArray, level="info") {
  if (!Array.isArray(strOrArray)) {
    strOrArray = [strOrArray];
  }

  let lines = [];
  for (let str of strOrArray) {
    const now = Date.now();
    lines.push({
      str,
      level,
      ts: now,
      id: now + id(6),
    })
  }
  return {
    type: ActionTypes.ADD_STDOUT_LINE,
    lines,
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

export function setShowWelcome(visible) {
  return {
    visible: visible,
    type: ActionTypes.SET_SHOW_WELCOME,
  }
}

export function setIsReceivingReports(isReceiving) {
  return {
    isReceiving,
    type: ActionTypes.SET_IS_RECEIVING_REPORTS,
  }
}

export function setSystemDetails(system) {
  return {
    system,
    type: ActionTypes.SET_SYSTEM_DETAILS,
  }
}

export function setSystemDetailsAndOpen(system) {
  return {
    system,
    type: ActionTypes.SET_SYSTEM_DETAILS_AND_OPEN,
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
export const ActionTypes = {
  ADD_STDOUT_LINE: "add_stdout_line",
  SELECT_PANEL_NAME: "select_panel_name",
  SET_FONT_SIZE: "set_font_size",
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

export function selectPanelName(name) {
  return {
    name,
    type: ActionTypes.SELECT_PANEL_NAME,
  }
}

export function setFontSize(fontSize) {
  return {
    fontSize,
    type: ActionTypes.SET_FONT_SIZE,
  }
}

export function resetState() {
  return {
    type: ActionTypes.RESET_STATE,
  }
}
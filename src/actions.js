export const ActionTypes = {
  ADD_STDOUT_LINE: "add_stdout_line",
}

export function addStdoutLine(str) {
  return {
    type: ActionTypes.ADD_STDOUT_LINE,
    ts: Date.now(),
    str,
  }
}
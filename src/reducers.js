import { ActionTypes } from "./actions"
import { MAX_CONSOLE_LINES } from "./constants";

export const initialState = {
  stdout: [],
}

function shiftOldFromArray(arr, max) {
  if (arr.length + 1 > max) {
    arr.shift();
  }
  return arr;
}

function limitedAppend(arr, el, limit) {
  return [...shiftOldFromArray(arr, limit), el]
}

function rootReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_STDOUT_LINE:
      return {
        ...state,
        stdout: limitedAppend(state.stdout, action.str, MAX_CONSOLE_LINES),
      }
    default:
      return initialState;
  }
}

export default rootReducer;
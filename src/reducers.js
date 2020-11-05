import { ActionTypes } from "./actions"
import { MAX_CONSOLE_LINES, Tools } from "./constants";
import { FONTSIZE } from "./EchoesMap/canvas/consts";
import Storage from "./storage";

export const initialState = {
  stdout: [],
  activeTools: {
    [Tools.CREATION]: 0,
    [Tools.SEARCH]: 0,
    [Tools.FILTER]: 0,
    [Tools.PLANET]: 0,
    [Tools.SETTINGS]: 1,
  },
  activeTabsNames: {
    [Tools.CREATION]: null,
    [Tools.SEARCH]: null,
    [Tools.FILTER]: null,
    [Tools.PLANET]: null,
    [Tools.SETTINGS]: null,
  },
  fontSize: FONTSIZE,
}

// defaultState overwrites initialState before being persisted. So
// properties here won't be persisted, they have defaults instead.
export const defaultState = {

}

export function getInitialState() {
  const fromStorage = new Storage().get();

  // Merge initialState with storage for max. compatibility when it
  // gets updated
  return {
    ...initialState,
    ...fromStorage,
  }
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
      const newLine = {
        ts: action.ts,
        str: action.str,
        level: action.level,
      }
      return {
        ...state,
        stdout: limitedAppend(state.stdout, newLine, MAX_CONSOLE_LINES),
      }
    case ActionTypes.SELECT_PANEL_NAME:
      return {
        ...state,
        activeTabsNames: {
          ...state.activeTabsNames,
          [action.tool]: action.selected,
        }
      }
    case ActionTypes.SET_PANEL_VISIBILITY:
      return {
        ...state,
        activeTools: {
          ...state.activeTools,
          [action.tool]: action.visible,
        }
      }
    case ActionTypes.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.fontSize,
      }
    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        // Reset everything except the console
        stdout: state.stdout,
      }
    default:
      return initialState;
  }
}

function persistentReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SELECT_PANEL_NAME:
    case ActionTypes.SET_PANEL_VISIBILITY:
    case ActionTypes.ADD_STDOUT_LINE:
    case ActionTypes.SET_FONT_SIZE:
    case ActionTypes.RESET_STATE:
      const newState = rootReducer(state, action);
      const clean = {...newState, ...defaultState}
      new Storage().save(clean);
      return newState;
    default:
      return rootReducer(state, action);
  }
}

export default persistentReducer;
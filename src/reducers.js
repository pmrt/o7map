import { ActionTypes } from "./actions"
import { MAX_CONSOLE_LINES, Tools } from "./constants";
import { FONTSIZE } from "./EchoesMap/canvas/consts";
import Storage from "./storage";

export const initialState = {
  stdout: [],
  activeTools: {
    [Tools.CREATION]: 0,
    [Tools.SEARCH]: 1,
    [Tools.SYSTEM_DETAILS]: 0,
    [Tools.FILTER]: 0,
    [Tools.PLANET]: 0,
    [Tools.SETTINGS]: 0,
    [Tools.FEEDBACK]: 0,
    [Tools.ABOUT]: 0,
  },
  activeTabsNames: {
    [Tools.CREATION]: null,
    [Tools.SEARCH]: null,
    [Tools.FILTER]: null,
    [Tools.PLANET]: null,
    [Tools.SETTINGS]: null,
    [Tools.FEEDBACK]: null,
    [Tools.ABOUT]: null,
  },
  currentMap: {
    mapID: "",
    mapName: "",
    mapSec: "",
  },
  details: {
    system: null,
  },
  isReceivingReports: false,
  isLoading: 1,
  isDevMode: 0,
  showWelcome: 1,
  clickedCoords: {
    x: 0,
    y: 0,
  },
  fontSize: FONTSIZE,
}

// defaultState overwrites initialState before being persisted. So
// properties here won't be persisted, they have defaults instead.
export const defaultState = {
  currentMap: {
    mapID: "",
    mapName: "",
    mapSec: "",
  },
  details: {
    system: null,
  },
  clickedCoords: {
    x: 0,
    y: 0,
  },
  isLoading: 1,
  isReceivingReports: false,
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

function append(arr, items, limit) {
  let newArr = arr;
  for (let el of items) {
    newArr = limitedAppend(newArr, el, limit)
  }
  return newArr;
}

function rootReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_STDOUT_LINE:
      return {
        ...state,
        stdout: append(state.stdout, action.lines, MAX_CONSOLE_LINES),
      }
    case ActionTypes.SET_CURRENT_MAP:
      return {
        ...state,
        currentMap: {
          mapID: action.id+"",
          mapName: action.name,
          mapSec: action.sec,
        },
      }
    case ActionTypes.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
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
    case ActionTypes.SET_SYSTEM_DETAILS_AND_OPEN:
      return {
        ...state,
        activeTools: {
          ...state.activeTools,
          [Tools.SYSTEM_DETAILS]: 1,
        },
        details: {
          ...state.details,
          system: action.system,
        }
      }
    case ActionTypes.SET_IS_RECEIVING_REPORTS:
      return {
        ...state,
        isReceivingReports: action.isReceiving,
      }
    case ActionTypes.SET_SYSTEM_DETAILS:
      return {
        ...state,
        details: {
          ...state.details,
          system: action.system,
        }
      }
    case ActionTypes.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.fontSize,
      }
    case ActionTypes.SET_IS_DEV_MODE:
      return {
        ...state,
        isDevMode: action.isDevMode,
      }
    case ActionTypes.SET_CLICKED_COORDS:
      return {
        ...state,
        clickedCoords: action.coords,
      }
    case ActionTypes.SET_SHOW_WELCOME:
      return {
        ...state,
        showWelcome: action.visible,
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
    case ActionTypes.SET_IS_DEV_MODE:
    case ActionTypes.SET_SHOW_WELCOME:
      const newState = rootReducer(state, action);
      const clean = {...newState, ...defaultState}
      new Storage().save(clean);
      return newState;
    default:
      return rootReducer(state, action);
  }
}

export default persistentReducer;
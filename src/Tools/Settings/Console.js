import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { FixedSizeList as List } from "react-window";

import { addStdoutLine } from "../../actions"
import exec, { extractCmd, UnkownCommandError, UnkownParameterError } from "../../cmd";
import { RootDispatch } from "../../context";
import "./Console.css";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute:'2-digit',
    second: '2-digit',
  });
}

const LineKey = (index, data) => index;

const Line = ({ index, style, data }) => {
  const { ts, str, level } = data[index];
  return (
    <span className={`stdout-line ${level}`} style={style}>
      <small>{formatTime(ts)}</small>
      {str.substr(0,68)}
    </span>
  )
};

const ListStyle = {
  willChange: "auto"
}

const StdoutList = ({ stdout }) => {
  let ref = useRef(null);

  useEffect(() => {
    ref.current.scrollToItem(stdout.length - 1)
  })

  return (
    <List
      className="stdout-list panel"
      height={250}
      itemCount={stdout.length}
      itemSize={20}
      itemKey={LineKey}
      itemData={stdout}
      ref={ref}
      style={ListStyle}
    >
      {({ index, style, data}) =>
        <Line
          index={index}
          style={style}
          data={data}
        />}
    </List>
  )
}

const CommandActions = {
  ADD_COMMAND_TO_HISTORY: "add_command_to_history",
  SET_COMMAND_HISTORY_CURSOR: "set_command_history_cursor",
  SET_COMMAND_HISTORY_VISIBLE: "set_command_history_visible",
}

const initialCommandState = {
  history: [],
  cursor: 0,
}

function commandReducer(state, action) {
  switch(action.type) {
    case CommandActions.ADD_COMMAND_TO_HISTORY:
      return {
        ...state,
        history: [...state.history, action.command]
      }
    case CommandActions.SET_COMMAND_HISTORY_CURSOR:
      return {
        ...state,
        cursor: action.cursor,
      }
    default:
      return initialCommandState;
  }
}

function Console({ stdout }) {
  const [cmdState, dispatchCmd] = useReducer(commandReducer, initialCommandState);

  const dispatch = useContext(RootDispatch);
  const log = useCallback((str, lvl="info") => {
    dispatch(addStdoutLine(str, lvl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (evt) => {
    const val = evt.target.value;
    const cursor = cmdState.cursor;

    switch(evt.code) {
      case "Enter":
        try {
          const cmd = extractCmd(val);
          exec(dispatch, cmd);
        } catch(err) {
          if (err instanceof UnkownCommandError) {
            log(`ERR: ${err.message}`, "error")
          }
          if (err instanceof UnkownParameterError) {
            log(`ERR: ${err.message}`, "error")
          }
          return;
        }
        evt.target.value = "";
        dispatchCmd({ type: CommandActions.ADD_COMMAND_TO_HISTORY, command: val })
        dispatchCmd({ type: CommandActions.SET_COMMAND_HISTORY_CURSOR, cursor: cmdState.history.length });

        evt.preventDefault();
        evt.stopPropagation();
        break;

      case "ArrowUp":
        const prevCmd = cmdState.history[cursor];

        if (!prevCmd) {
          return;
        }

        evt.target.value = prevCmd;
        dispatchCmd({ type: CommandActions.SET_COMMAND_HISTORY_CURSOR, cursor: Math.max(0, cursor - 1) });
        evt.preventDefault();
        evt.stopPropagation();
        break;

      case "ArrowDown":
        if (cursor + 1 > cmdState.history.length - 1) {
          evt.target.value = "";
          return;
        }

        const nextCursor = Math.min(cmdState.history.length - 1, cursor + 1);
        const nextCmd = cmdState.history[nextCursor];
        evt.target.value = nextCmd;
        dispatchCmd({ type: CommandActions.SET_COMMAND_HISTORY_CURSOR, cursor: nextCursor });
        evt.preventDefault();
        evt.stopPropagation();
        break;

      default:
    }
  }

  return (
    <div className="console">
      <StdoutList stdout={stdout}/>
      <div className="input-wrapper">
        <input type="text" onKeyDown={onKeyDown}></input>
        <span className="input-placeholder"></span>
      </div>
    </div>
  )
}

export default Console;
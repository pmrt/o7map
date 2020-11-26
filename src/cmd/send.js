import { addStdoutLine } from "../actions";
import { FEEDBACK, ERROR, ROOT_STATE_STORAGE_KEY } from "../constants";

import { UnknownParameterError } from "./index";

async function sendFeedback(ctx, args) {
  const { dispatcher } = ctx;
  let [msg, type] = args.join(" ").match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
  msg = msg.substr(1, msg.length-1).substr(0, msg.length-2);

  const reqData = {
    msg,
    t: type,
  }

  let resp;
  try {
    resp = await fetch(FEEDBACK, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqData),
    })
    resp = await resp.json()
  } catch (err) {
    let msg =
      resp && resp.message
        ? "ERR: Couldn't send feedback report. " + resp.message
        : "ERR: Couldn't send feedback report";

    dispatcher(addStdoutLine(msg))
    return;
  }

  if (resp.code && resp.code === 200) {
    dispatcher(addStdoutLine(resp.message))
  }
}

async function sendError(ctx, args) {
  const { dispatcher } = ctx;

  const persistedStr = window.localStorage.getItem(ROOT_STATE_STORAGE_KEY);

  if (!persistedStr) {
    return;
  }

  const persisted = JSON.parse(persistedStr);

  let resp;
  try {
    resp = await fetch(ERROR, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(persisted.stdout),
    })
    resp = await resp.json()
  } catch (err) {
    let msg =
      resp && resp.message
        ? "ERR: Couldn't send error report. " + resp.message
        : "ERR: Couldn't send error report";

    dispatcher(addStdoutLine(msg))
    return;
  }

  if (resp.code && resp.code === 200) {
    dispatcher(addStdoutLine(resp.message))
  }
}

const props = {
  "feedback": sendFeedback,
  "debug": sendError,
}

function send(ctx, cmd) {
  const propName = cmd.shift();
  const handler = props[propName];
  if (!handler) {
    throw new UnknownParameterError(`Send: unknown parameter: ${propName}`);
  }

  handler.call(this, ctx, cmd);
}

export default send;


import { UnkownParameterError } from "./index";
import { addStdoutLine, resetState, setIsDevMode, setFontSize as setFontSizeAction } from "../actions";

function setFontSize(ctx, args) {
  const { dispatcher } = ctx;
  const v = args[0];
  dispatcher(setFontSizeAction(v));
  dispatcher(addStdoutLine(`-> font_size set to ${v}`));
}

function setDefaults(ctx, args) {
  const { dispatcher } = ctx;
  dispatcher(resetState());
  dispatcher(addStdoutLine(`-> Settings restored to defaults`));
}

function setDevMode(ctx, args) {
  const { dispatcher } = ctx;
  const v = !!parseInt(args[0]);
  dispatcher(setIsDevMode(v));
  dispatcher(addStdoutLine(`-> dev_mode set to ${v}`));
}

const props = {
  "font_size": setFontSize,
  "dev_mode": setDevMode,
  "defaults": setDefaults,
}

function set(ctx, cmd) {
  const propName = cmd.shift();
  const handler = props[propName];
  if (!handler) {
    throw new UnkownParameterError(`Cannot set unkown parameter: ${propName}`);
  }

  handler.call(this, ctx, cmd);
}

export default set;
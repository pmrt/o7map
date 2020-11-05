
import { UnkownParameterError } from "./index";
import { addStdoutLine, resetState, setFontSize as setFontSizeAction } from "../actions";

function setFontSize(dispatcher, args) {
  const v = args[0];
  dispatcher(setFontSizeAction(v));
  dispatcher(addStdoutLine(`-> font_size set to ${v}`));
}

function setDefaults(dispatcher, args) {
  dispatcher(resetState());
  dispatcher(addStdoutLine(`-> Settings restored to defaults. You may should refresh the page.`));
}

const props = {
  "font_size": setFontSize,
  "defaults": setDefaults,
}

function set(dispatcher, cmd) {
  const propName = cmd.shift();
  const handler = props[propName];
  if (!handler) {
    throw new UnkownParameterError(`Cannot set unkown parameter: ${propName}`);
  }

  handler.call(this, dispatcher, cmd);
}

export default set;
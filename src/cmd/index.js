import set from "./set";
import help from "./help";
import map from "./map";
import print from "./print";
import { addStdoutLine } from "../actions";

export class CommandError extends Error {
  constructor(message="", code) {
    super(message);
    this.code = code;
    this.name = 'CommandError';
  }
}

export class UnkownCommandError extends CommandError {
  constructor(message) {
    super(message);
    this.code = "UNKOWNCMD";
  }
}

export class UnkownParameterError extends CommandError {
  constructor(message) {
    super(message);
    this.code = "UNKOWNPARAM";
  }
}

const commands = {
  "set": set,
  "help": help,
  "map": map,
  "print": print,
}

function extractCmd(str) {
  return str.split(/\s+/);
}

class Commander {
  constructor(dispatcher, mapRef) {
    this._mapRef = mapRef;
    this._dispatcher = dispatcher;
  }

  parseAndExec(str) {
    return this.exec(extractCmd(str));
  }

  stringifyCmd(cmd) {
    return cmd.join(" ");
  }

  exec(cmd) {
    const strCmd = this.stringifyCmd(cmd);
    this._dispatcher(addStdoutLine("$ > " + strCmd));

    const cmdName = cmd.shift();
    const handler = commands[cmdName];
    if (!handler) {
      throw new UnkownCommandError(`Command not found: ${cmdName}`);
    }

    const ctx = {
      dispatcher: this._dispatcher,
      mapRef: this._mapRef,
    }
    handler.call(this, ctx, cmd);

    return this;
  }
}

export default Commander;
import set from "./set";
import help from "./help";
import map from "./map";
import print from "./print";
import send from "./send";
import { addStdoutLine } from "../actions";

export class CommandError extends Error {
  constructor(message="", code) {
    super(message);
    this.code = code;
    this.name = 'CommandError';
  }
}

export class UnknownCommandError extends CommandError {
  constructor(message) {
    super(message);
    this.code = "UNKNOWNCMD";
  }
}

export class UnknownParameterError extends CommandError {
  constructor(message) {
    super(message);
    this.code = "UNKNOWNPARAM";
  }
}

const commands = {
  "set": set,
  "help": help,
  "map": map,
  "send": send,
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

  async exec(cmd) {
    const strCmd = this.stringifyCmd(cmd);
    this._dispatcher(addStdoutLine("$ > " + strCmd));

    const cmdName = cmd.shift();
    const handler = commands[cmdName];
    if (!handler) {
      throw new UnknownCommandError(`Command not found: ${cmdName}`);
    }

    const ctx = {
      dispatcher: this._dispatcher,
      mapRef: this._mapRef,
    }

    return await handler.call(this, ctx, cmd);
  }
}

export default Commander;
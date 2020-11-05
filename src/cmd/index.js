import set from "./set";

class CommandError extends Error {
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
}

function exec(dispatcher, cmd) {
  const cmdName = cmd.shift();
  const handler = commands[cmdName];
  if (!handler) {
    throw new UnkownCommandError(`Command not found: ${cmdName}`);
  }

  handler.call(this, dispatcher, cmd);
}

export function extractCmd(str) {
  return str.split(/\s+/);
}

export default exec;
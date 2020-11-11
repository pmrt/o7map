import { CommandError, UnkownParameterError } from ".";
import { addStdoutLine } from "../actions";

function db(ctx, args) {
  const { dispatcher, mapRef } = ctx;

  const map = mapRef.current;

  if (!map) {
    throw new CommandError("Couldn't render anything. Map is not available.");
  }

  console.log(map._db);

  dispatcher(addStdoutLine(`-> Database object sent to browser console`));
}

const params = {
  "db": db,
}

function print(ctx, cmd) {
  const paramName = cmd.shift();
  const handler = params[paramName];
  if (!handler) {
    throw new UnkownParameterError(`Print: unkown parameter: ${paramName}`);
  }

  handler.call(this, ctx, cmd);
}

export default print;
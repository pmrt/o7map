import { CommandError, UnknownParameterError } from ".";
import { addStdoutLine } from "../actions";
import { MapType } from "../EchoesMap/canvas/consts";

function render(ctx, args) {
  const {  mapRef } = ctx;

  const map = mapRef.current;

  if (!map) {
    throw new CommandError("Couldn't render anything. Map is not available.");
  }

  const mapType = args.shift();
  switch (mapType) {
    case MapType.UNIVERSE:
      map.drawUniverse();
      break;
    default:
      throw new UnknownParameterError(`MapType not found: '${mapType}'`);
  }
}

function center(ctx, args) {
  const {  dispatcher, mapRef } = ctx;

  const map = mapRef.current;

  if (!map) {
    throw new CommandError("Couldn't render anything. Map is not available.");
  }

  map.centerInViewPort();
  dispatcher(addStdoutLine(`:: Centering map in viewport`));
}


const params = {
  "render": render,
  "center": center,
}

function map(ctx, cmd) {
  const paramName = cmd.shift();
  const handler = params[paramName];
  if (!handler) {
    throw new UnknownParameterError(`Map: unknown parameter: ${paramName}`);
  }

  handler.call(this, ctx, cmd);
}

export default map;
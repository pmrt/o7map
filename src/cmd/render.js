import { CommandError, UnkownParameterError } from ".";

const { MapType } = require("../EchoesMap/canvas/consts");

function render(ctx, cmd) {
  const {  mapRef } = ctx;

  const map = mapRef.current;

  if (!map) {
    throw new CommandError("Couldn't render anything. Map is not available.");
  }

  const mapType = cmd.shift();
  switch (mapType) {
    case MapType.UNIVERSE:
      map.drawUniverse();
      break;
    default:
      throw new UnkownParameterError(`MapType not found: '${mapType}'`);
  }

}

export default render;
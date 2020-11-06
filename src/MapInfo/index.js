import Contextual from "./Contextual";

function MapInfo({ currentMap, isLoading }) {
  return (
    <Contextual
      isLoading={isLoading}
      currentMap={currentMap}
    />
  )
}

export default MapInfo;
import "./Contextual.css";

function NoMap() {
  return (
    <div className="contextual">
      <h1>Universe</h1>
    </div>
  )
}

function Contextual({ currentMap, isLoading }) {
  const { mapID, mapName, mapSec } = currentMap;

  const Loader = isLoading
    ? (
      <div className="loader-wrapper">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    )
    : null;

  console.log(Loader);

  if (!mapID || !mapName || !mapSec) {
    return (
      <div className="contextual-wrapper">
        {Loader}
        <NoMap />
      </div>
    );
  }

  return (
    <div className="contextual-wrapper">
      {Loader}
      <div className="contextual">
        <h1>{ mapName }</h1>
        <ul>
          <li>id: {mapID}</li>
          <li>sec: {mapSec}</li>
        </ul>
      </div>
    </div>
  )
}

export default Contextual;
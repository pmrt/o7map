import "./Contextual.css";

function Contextual({ mapID, mapName, mapSec }) {
  if (!mapID || !mapName || !mapSec) {
    return null;
  }

  return (
    <div className="contextual">
      <h1>{ mapName }</h1>
      <ul>
        <li>id: {mapID}</li>
        <li>sec: {mapSec}</li>
      </ul>
    </div>
  )
}

export default Contextual;
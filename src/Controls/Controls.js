import Draggable from 'react-draggable';

import Console from "./panels/Console";
import "./Controls.css";

function Controls({ stdout }) {
  return (
    <Draggable
      axis="both"
      handle=".draggable"
      defaultPosition={{x: 50, y: 25}}
      grid={[25, 25]}
      scale={1}
    >
      <div className="controls">
        <div className="topbar draggable">
          <h3>Console</h3>
        </div>
        <div className="panel">
          <Console stdout={stdout}/>
        </div>
      </div>
    </Draggable>
  )
}

export default Controls;
import { useCallback } from "react";

import "./Mapbar.css";

function Mapbar({ cmdRef }) {
  const onUniverseClick = useCallback(() => {
    const cmd = cmdRef.current;
    if (!cmd) {
      return null;
    }

    cmd.exec(["render", "universe"]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mapbar">
      <div className="mapbar-btn" onClick={onUniverseClick}>🌍</div>
    </div>
  )
}

export default Mapbar;
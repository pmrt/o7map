import { useCallback } from "react";
import { fabric } from "fabric-with-gestures";

function useFabric(fabricRef, fabricOpts) {
  // return a callback ref https://reactjs.org/docs/refs-and-the-dom.html#callback-refs & https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  return useCallback((node) => {
    // when ref changes and the node is available
    if (node) {
      fabric.Object.prototype.objectCaching = false;
      fabricRef.current = new fabric.Canvas(node, fabricOpts);
    // when ref changes and the node isn't available but we got the old fabric canvas
    } else if (fabricRef.current) {
      // clean the canvas and all event listeners. http://fabricjs.com/docs/fabric.Canvas.html#dispose
      fabricRef.current.dispose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useFabric;
import { useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import "./Console.css";

const LineKey = (index, data) => index;

const Line = ({ index, style, data }) => (
  <span class="stdout-line" style={style}>
    {data[index]}
  </span>
);

const StdoutList = ({ stdout }) => {
  let ref = useRef(null);

  useEffect(() => {
    ref.current.scrollToItem(stdout.length - 1)
  })

  return (
    <List
      className="stdout-list"
      height={200}
      itemCount={10}
      itemSize={20}
      itemKey={LineKey}
      itemData={stdout}
      ref={ref}
    >
      {({ index, style, data}) =>
        <Line
          index={index}
          style={style}
          data={data}
        />}
    </List>
  )
}

function Console({ stdout }) {
  return (
    <StdoutList stdout={stdout}/>
  )
}

export default Console;
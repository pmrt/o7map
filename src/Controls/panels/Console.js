import { useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import "./Console.css";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute:'2-digit',
    second: '2-digit',
  });
}

const LineKey = (index, data) => index;

const Line = ({ index, style, data }) => {
  const { ts, str, level } = data[index];
  return (
    <span className={`stdout-line ${level}`} style={style}>
      <small>{formatTime(ts)}</small>
      {str}
    </span>
  )
};

const ListStyle = {
  willChange: "auto"
}

const StdoutList = ({ stdout }) => {
  let ref = useRef(null);

  useEffect(() => {
    ref.current.scrollToItem(stdout.length - 1)
  })

  return (
    <List
      className="stdout-list panel"
      height={200}
      itemCount={stdout.length}
      itemSize={20}
      itemKey={LineKey}
      itemData={stdout}
      ref={ref}
      style={ListStyle}
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
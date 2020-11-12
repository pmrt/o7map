import { Fragment, useCallback, useMemo } from "react";
import { useTable, useBlockLayout } from "react-table";
import { FixedSizeList } from 'react-window';

import "./Table.css"

const formatCell = (val, limit) => {
  val = val+"";
  return val.length > limit
      ? `${val.substr(0, limit)}.`
      : val;
}

const noop = () => null;

function Table({
  columns,
  data,
  height,
  width = 0,
  rowSize = 18,
  cellLimit = 10,
  columnWidth = 100,
  onRowClick = noop,
  onCellClick = noop,
}) {
  const defaultColumn = useMemo(() => {
    return {
      width: columnWidth,
    }
  }, [columnWidth]);

  const {
    getTableProps,
    getTableBodyProps,
    totalColumnsWidth,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns, data, defaultColumn
  },
  useBlockLayout,
  )

  const Row = useCallback(
    ({ index, style}) => {
      const row = rows[index];
      prepareRow(row)
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="tr"
          onClick={() => onRowClick(row, index)}
        >
          {row.cells.map((cell, i) => {
            return (
              <div {...cell.getCellProps()} alt={cell.value} className="td" onClick={() => onCellClick(cell, i)}>
                {formatCell(cell.value, cellLimit)}
              </div>
            )
          })}
        </div>
      )
    },
    [rows, prepareRow, onRowClick, onCellClick, cellLimit]
  )

  return (
    <div className="table-wrapper">
      <div {...getTableProps()} className="table">
        <Fragment>
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map(column => (
                <div {...column.getHeaderProps()} className="th">
                  {column.render("Header")}
                </div>
              ))}
            </div>
          ))}
        </Fragment>

        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={height}
            width={width || totalColumnsWidth}
            itemCount={rows.length}
            itemSize={rowSize}
            className="atlas-scroll atlas-rows-wrapper"
          >
            {Row}
          </FixedSizeList>
        </div>
      </div>
    </div>
  )

}

export default Table;
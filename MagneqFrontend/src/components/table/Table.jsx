import React from 'react'

const Table = ({ children, className }) => {
  return <table className={`min-w-full ${className || ''}`}>{children}</table>
}

const TableHeader = ({ children, className }) => {
  return <thead className={className}>{children}</thead>
}

const TableBody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>
}

const TableRow = ({ children, className , rowOnClick}) => {
  return <tr className={className} onClick={() => rowOnClick()}>{children}</tr>
}

const TableCell = ({ children, isHeader = false, className }) => {
  const CellTag = isHeader ? 'th' : 'td'
  return <CellTag className={className}>{children}</CellTag>
}

export { Table, TableHeader, TableBody, TableRow, TableCell }
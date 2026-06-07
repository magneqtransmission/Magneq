import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/table/Table";

const POTable = ({ items, getHeaders, onDelete }) => {
  const headers = getHeaders();

  return (
    <div className="mt-10 rounded-2xl overflow-hidden border">
      <Table className="text-sm text-left w-full">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header} isHeader className="px-6 py-4 font-medium">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center py-6 text-gray-400">
                No items added yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="px-6 py-2">{row.class_type}</TableCell>
                <TableCell className="px-6 py-2">{row.type || ""}</TableCell>
                <TableCell className="px-6 py-2">{row.name || ""}</TableCell>
                <TableCell className="px-6 py-2">{row.rawMaterial?.name || ""}</TableCell>
                <TableCell className="px-6 py-2">{row.quantity}</TableCell>
                <TableCell className="px-6 py-2">{row.price_per_unit || ""}</TableCell>
                <TableCell className="px-6 py-2">
                  <button
                    className="text-red-500 bg-red-100 px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    onClick={() => onDelete(index)}
                  >
                    <span className="text-[14px]">🖉</span> Delete
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default POTable;

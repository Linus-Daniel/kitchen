"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";
import { DataTablePagination } from "./dataTablePaagination";

interface DataTableProps<TData> {
  columns: {
    accessorKey: string;
    header: string;
    cell?: (row: TData) => React.ReactNode;
  }[];
  data: TData[];
  searchKey?: string;
  filterOptions?: {
    label: string;
    value: string;
    icon?: keyof typeof Icons;
  }[];
}

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  filterOptions,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, column) => ({ ...acc, [column.accessorKey]: true }), {})
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search
  const filteredData = searchKey
    ? data.filter((item) =>
        String((item as any)[searchKey])
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : data;

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const visibleColumns = columns.filter(
    (column) => columnVisibility[column.accessorKey]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {searchKey && (
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Filter ${searchKey}...`}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            {filterOptions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8">
                    <Icons.filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {filterOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      className="capitalize"
                      checked={columnVisibility[option.value] ?? false}
                      onCheckedChange={(value) =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [option.value]: value,
                        }))
                      }
                    >
                      {
                      option.icon && (
                        // <Icons.[option.icon] className="mr-2 h-4 w-4" />
                        <div>
                            <Icons.image />
                        </div>
                      )
                      }
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 ml-auto">
              <Icons.slider className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.accessorKey}
                className="capitalize"
                checked={columnVisibility[column.accessorKey] ?? false}
                onCheckedChange={(value) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    [column.accessorKey]: value,
                  }))
                }
              >
                {column.accessorKey}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell(row)
                        : String((row as any)[column.accessorKey])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </div>
  );
}
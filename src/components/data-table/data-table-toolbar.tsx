"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "name",
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchColumn = table.getColumn(searchKey);
  const friendlyPlaceholder = searchKey.charAt(0).toUpperCase() + searchKey.slice(1);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <Input
            placeholder={`Search ${friendlyPlaceholder}...`}
            value={(searchColumn.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              searchColumn.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[350px]"
          />
        )}
        {/* {table.getColumn("zipcode") && (
          <DataTableFacetedFilter
            column={table.getColumn("zipcode")}
            title="Zipcode"
            options={statuses}
          />
        )} */}
        {/* {table.getColumn("city") && (
          <DataTableFacetedFilter
            column={table.getColumn("city")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  );
}

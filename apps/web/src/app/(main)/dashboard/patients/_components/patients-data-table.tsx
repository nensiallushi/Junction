"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "@zenncore/icons";
import {
  DataTable,
  DataTableEmpty,
  DataTablePagination,
  DataTableProvider,
} from "@zenncore/web/components/data-table";
import type { Route } from "next";
import Link from "next/link";
import { age, formatDate, initials, sexLabel } from "@/lib/medical";
import type * as Patient from "@/server/app/patient";

type Row = Patient.Type & { _id: string };

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: "Pacienti",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-foreground-dimmed text-xs">
          {initials(row.original.name)}
        </span>
        <span className="font-medium text-foreground text-sm">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "mrn",
    header: "MRN",
    cell: ({ row }) => (
      <span className="text-caption text-sm">{row.original.mrn}</span>
    ),
  },
  {
    accessorKey: "dateOfBirth",
    header: "Datëlindja",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-foreground text-sm">
        {formatDate(row.original.dateOfBirth)} · {age(row.original.dateOfBirth)}{" "}
        vjeç
      </span>
    ),
  },
  {
    accessorKey: "sex",
    header: "Gjinia",
    cell: ({ row }) => (
      <span className="text-foreground text-sm">
        {sexLabel(row.original.sex)}
      </span>
    ),
  },
  {
    id: "open",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/patients/${row.original.id}` as Route}
        className="flex size-8 items-center justify-center rounded-full text-foreground-dimmed transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Open patient"
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    ),
  },
];

export const PatientsDataTable = ({ rows }: { rows: Row[] }) => (
  <DataTableProvider rows={rows} columns={columns} pageSize={12}>
    <div className="overflow-hidden rounded-card border border-accent bg-card/60">
      <DataTable
        classList={{
          "body-row": "transition-colors hover:bg-card-hover",
          "body-cell": "py-3",
        }}
      >
        <DataTableEmpty>Asnjë pacient i gjetur.</DataTableEmpty>
      </DataTable>
    </div>
    <DataTablePagination />
  </DataTableProvider>
);

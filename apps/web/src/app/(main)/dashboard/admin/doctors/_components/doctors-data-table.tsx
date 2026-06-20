"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@zenncore/utils";
import {
  DataTable,
  DataTableEmpty,
  DataTableProvider,
} from "@zenncore/web/components/data-table";
import type { DoctorStatus } from "@/lib/medical";
import { doctorStatusLabel, initials, roleLabel } from "@/lib/medical";
import type * as Doctor from "@/server/app/doctor";

type Row = Doctor.Type & { _id: string };

const STATUS: Record<DoctorStatus, string> = {
  active: "bg-success/15 text-success",
  invited: "bg-warning/15 text-warning",
  disabled: "bg-accent text-foreground-dimmed",
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: "Mjeku",
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-caption text-sm">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Roli",
    cell: ({ row }) => (
      <span className="text-foreground text-sm">
        {roleLabel(row.original.role)}
      </span>
    ),
  },
  {
    accessorKey: "specialty",
    header: "Specialiteti",
    cell: ({ row }) => (
      <span className="text-caption text-sm">
        {row.original.specialty ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Statusi",
    cell: ({ row }) => (
      <span
        className={cn(
          "rounded-pill px-2 py-1 font-medium text-xs",
          STATUS[row.original.status],
        )}
      >
        {doctorStatusLabel(row.original.status)}
      </span>
    ),
  },
];

export const DoctorsDataTable = ({ rows }: { rows: Row[] }) => (
  <DataTableProvider rows={rows} columns={columns} pageSize={20}>
    <div className="overflow-hidden rounded-card border border-accent bg-card/60">
      <DataTable
        classList={{
          "body-row": "transition-colors hover:bg-card-hover",
          "body-cell": "py-3",
        }}
      >
        <DataTableEmpty>Ende asnjë mjek.</DataTableEmpty>
      </DataTable>
    </div>
  </DataTableProvider>
);

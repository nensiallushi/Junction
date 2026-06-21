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
import { DeleteDoctorButton } from "./delete-doctor-button";

type Row = Doctor.Type & { _id: string };

const STATUS: Record<DoctorStatus, string> = {
  active: "bg-success/15 text-success",
  invited: "bg-warning/15 text-warning",
  disabled: "bg-accent text-foreground-dimmed",
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    // indent past the avatar so the header sits above the names, not the initials
    header: () => <span className="block pl-10">Mjeku</span>,
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
    header: () => <span className="block text-right">Statusi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <span
          className={cn(
            "rounded-pill px-2 py-1 font-medium text-xs",
            STATUS[row.original.status],
          )}
        >
          {doctorStatusLabel(row.original.status)}
        </span>
      </div>
    ),
  },
];

export const DoctorsDataTable = ({
  rows,
  currentUserId,
}: {
  rows: Row[];
  currentUserId: string;
}) => {
  const allColumns: ColumnDef<Row>[] = [
    ...columns,
    {
      id: "actions",
      header: () => <span className="block text-right">Veprime</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original.id === currentUserId ? (
            <span className="flex size-8 items-center justify-center text-caption text-xs">
              Ti
            </span>
          ) : (
            <DeleteDoctorButton
              doctor={row.original.id}
              name={row.original.name}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTableProvider rows={rows} columns={allColumns} pageSize={20}>
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
};

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
import { RiskChip, RiskGauge, StatusPill } from "@/components/severity";
import { formatDate, initials, modalityLabel } from "@/lib/medical";
import type * as Study from "@/server/app/study";

type Row = Study.View & { _id: string };

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "patient",
    header: "Pacienti",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-icon bg-accent font-semibold text-foreground-dimmed text-xs">
          {initials(row.original.patient.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground text-sm">
            {row.original.patient.name}
          </p>
          <p className="truncate text-caption text-xs">
            {row.original.patient.mrn}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "modality",
    header: "Studimi",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-foreground text-sm">
        {modalityLabel(row.original.modality)} {row.original.bodyPart}
      </span>
    ),
  },
  {
    accessorKey: "riskValue",
    header: "Rreziku",
    cell: ({ row }) =>
      row.original.riskBand != null && row.original.riskValue != null ? (
        <div className="flex w-40 items-center gap-2">
          <RiskGauge
            value={row.original.riskValue}
            band={row.original.riskBand}
            className="w-16"
          />
          <RiskChip
            band={row.original.riskBand}
            value={row.original.riskValue}
          />
        </div>
      ) : (
        <span className="text-caption text-sm">Në pritje</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Statusi",
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "studyDate",
    header: "Data",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-caption text-sm">
        {formatDate(row.original.studyDate)}
      </span>
    ),
  },
  {
    id: "open",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/studies/${row.original.id}` as Route}
        className="flex size-8 items-center justify-center rounded-full text-foreground-dimmed transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Open study"
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    ),
  },
];

export const WorklistDataTable = ({ rows }: { rows: Row[] }) => (
  <DataTableProvider rows={rows} columns={columns} pageSize={10}>
    <div className="overflow-hidden rounded-card border border-accent bg-card/60">
      <DataTable
        classList={{
          "body-row": "transition-colors hover:bg-card-hover",
          "body-cell": "py-3",
        }}
      >
        <DataTableEmpty>
          Asnjë studim nuk përputhet me këtë filtër.
        </DataTableEmpty>
      </DataTable>
    </div>
    <DataTablePagination />
  </DataTableProvider>
);

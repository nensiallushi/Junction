// "use client";

import {
  DataTable,
  DataTableEmpty,
  // DataTableFooter,
  DataTableProvider,
} from "@zenncore/web/components/data-table";
// import { TableCell, TableRow } from "@zenncore/web/components/table";

export default () => {
  return (
    <DataTableProvider
      rows={[]}
      rowCount={rows.length}
      handler="server"
      columns={columns}
      pageSize={20}
    >
      <DataTable>
        <DataTableEmpty>
          <p className="bg-blue-500">
            No data available lorem ipsum dolor sit amet lorem ipsum dolor sit
            ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum
            dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit
            ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum
            dolor sit amet
          </p>
        </DataTableEmpty>
        {/* <DataTableFooter>
          <TableRow>
            <TableCell>Hello</TableCell>
          </TableRow>
        </DataTableFooter> */}
      </DataTable>
    </DataTableProvider>
  );
};

const columns = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Phone",
    accessorKey: "phone",
  },
];

const rows = [
  {
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
  },
];

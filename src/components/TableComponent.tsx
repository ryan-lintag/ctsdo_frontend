import React, { useEffect, useState, type ReactNode } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

interface CustomProps {
  title: string;
  columns: {
    field: string;
    header: string;
    isSortable?: boolean;
    body?: any;
  }[];
  data: any;
  showFilter?: boolean;
}

export const TableComponent: React.FC<CustomProps> = ({
  title,
  columns,
  data,
  showFilter,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {}, []);
  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    );
  };
  const header = renderHeader();
  return (
    <div className="table-box">
      <h3>{title}</h3>
      <DataTable
        value={data}
        showGridlines
        stripedRows
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage="No record found."
        tableStyle={{ minWidth: "50rem" }}
        sortMode="multiple"
        filters={filters}
        header={showFilter ? header : null}
        globalFilterFields={columns?.map((c) => c.field)}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        {columns?.map((c) => {
          return (
            <Column
              body={c.body}
              field={c.field}
              header={c.header}
              sortable={c.isSortable}
            ></Column>
          );
        })}
      </DataTable>
    </div>
  );
};

export default TableComponent;

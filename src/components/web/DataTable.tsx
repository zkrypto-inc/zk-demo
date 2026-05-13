import type { DataTable as DataTableModel } from "@/scenarios/types";

type Props = {
  table: DataTableModel;
};

function alignClass(align: "left" | "center" | "right" = "left") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function gridTemplate(table: DataTableModel) {
  return table.columns.map((column) => column.width ?? "minmax(0, 1fr)").join(" ");
}

export function DataTable({ table }: Props) {
  const template = gridTemplate(table);
  const gridWidthClass = table.wrap ? "w-full" : "w-max min-w-full";
  const cellTextClass = table.wrap ? "whitespace-normal break-words leading-[1.45]" : "whitespace-nowrap";

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)]">
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div
            className={`grid ${gridWidthClass} items-center bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]`}
            style={{ gridTemplateColumns: template }}
          >
            {table.columns.map((column) => (
              <div className={`whitespace-nowrap px-3 py-2 ${alignClass(column.align)}`} key={column.key}>
                {column.label}
              </div>
            ))}
          </div>

          {table.rows.map((row, rowIndex) => (
            <div
              className={`grid ${gridWidthClass} items-start border-t border-[var(--line)] text-[11px] hover:bg-[var(--surface-2)]`}
              key={rowIndex}
              style={{ gridTemplateColumns: template }}
            >
              {table.columns.map((column) => (
                <div
                  className={`${cellTextClass} px-3 py-2 font-mono text-[var(--ink-2)] ${alignClass(column.align)}`}
                  key={column.key}
                  title={row[column.key]}
                >
                  {row[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ClassSummaryRow {
  name: string;
  color: string;
  points?: number;
}

interface Props {
  rows: ClassSummaryRow[];
  showPoints?: boolean;
  className?: string;
}

const HEAD_CLS =
  "px-3 py-2 text-left font-aptos text-xs font-semibold leading-4.5 text-text-icons-base-second";
const CELL_CLS =
  "px-3 py-1.5 text-left font-aptos text-xs leading-4.5 text-text-icons-base-main";

// Read-only class list for the step 2/3 summaries and the final summary
// dialog. Scrolls inside its own box with the header pinned.
export const ClassSummaryTable = ({
  rows,
  showPoints = false,
  className,
}: Props) => {
  const t = useTranslations("InteractivePanel");

  return (
    <div
      className={cn(
        "max-h-90 overflow-y-auto rounded-lg border border-text-icons-disabled bg-white",
        className,
      )}
    >
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-primary-red-pink-light">
          <tr>
            <th className={cn(HEAD_CLS, "w-14")}>
              {t("defineLUC.idColumnHeader")}
            </th>
            <th className={HEAD_CLS}>{t("defineLUC.lulcClassHeader")}</th>
            <th className={cn(HEAD_CLS, "w-32")}>
              {t("defineLUC.colorColumnHeader")}
            </th>
            {showPoints && (
              <th className={cn(HEAD_CLS, "w-20")}>
                {t("dataTraining.pointsColumn")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.name}-${index}`}
              className="border-t border-text-icons-base-fourth/60 even:bg-neutral-50"
            >
              <td className={CELL_CLS}>{index + 1}</td>
              <td className={CELL_CLS}>{row.name}</td>
              <td className={CELL_CLS}>
                <span className="flex flex-row items-center gap-x-2">
                  <span
                    className="size-3.5 shrink-0 rounded-sm border border-black/10"
                    style={{ backgroundColor: row.color }}
                  />
                  #{row.color.replace(/^#/, "").toUpperCase()}
                </span>
              </td>
              {showPoints && <td className={CELL_CLS}>{row.points ?? 0}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

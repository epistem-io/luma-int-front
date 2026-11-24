import { DEFAULT_LUC } from "@/constants";

export interface ClassCandidate {
  id: string | number;
  name: string;
  color: string;
}

// Which own-classification input methods the class list came from, so the
// summary can say "Upload Classes + Manual Input" when both were used. Rows
// saved before rows recorded their origin take it from the class source.
export const getClassInputMethods = (
  rows: QuickTableRow[],
  lucSource: string,
): { upload: boolean; manual: boolean } => {
  const fallback = lucSource === "excel" ? "upload" : "manual";
  const origins = new Set(
    rows
      .filter((row) => row.name.trim() !== "")
      .map((row) => row.origin ?? fallback),
  );
  return { upload: origins.has("upload"), manual: origins.has("manual") };
};

// The classes step 2 would hand to step 3, in submit order: the switched-on
// default classes, or the own-classification rows that have a name.
export const getConfirmedClasses = (input: {
  lucSource: string;
  defaultArray: number[];
  lucQuickRows: QuickTableRow[];
}): ClassCandidate[] =>
  input.lucSource === "default"
    ? input.defaultArray
        .map((id) => DEFAULT_LUC.find((item) => item.id === id))
        .filter((item): item is (typeof DEFAULT_LUC)[number] => Boolean(item))
        .map((item) => ({ id: item.id, name: item.name, color: item.color }))
    : input.lucQuickRows
        .filter((row) => row.name.trim() !== "")
        .map((row) => ({ id: row.classId, name: row.name, color: row.color }));

// A confirmed step 2 row in the shape step 3 keeps it (classArray), as
// every class submit stores it: numeric id (or -1), trimmed name.
export const toSubmittedClass = (candidate: ClassCandidate): LUCClass => ({
  class_id: Number(String(candidate.id).trim()) || -1,
  class_name: candidate.name.trim(),
  class_color: candidate.color,
});

// Whether step 2's Next can skip handing the classes to step 3 again: only
// when step 3 already has exactly these classes. Comparing the classes (not
// a "changed" flag) also covers a reload before Next and an edit that was
// changed back.
export const canSkipClassSubmit = (
  confirmed: ClassCandidate[],
  submitted: LUCClass[],
): boolean =>
  submitted.length > 0 &&
  confirmed.length === submitted.length &&
  confirmed.every((candidate, index) => {
    const next = toSubmittedClass(candidate);
    const current = submitted[index];
    return (
      next.class_id === current.class_id &&
      next.class_name === current.class_name &&
      next.class_color.toLowerCase() === current.class_color.toLowerCase()
    );
  });

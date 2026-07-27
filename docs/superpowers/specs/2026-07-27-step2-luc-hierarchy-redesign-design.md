# Step 2 — Land Use/Cover Hierarchy Redesign + EPISTEM-AI Section

**Date:** 2026-07-27
**Component:** `src/app/[locale]/components/DefineLUCComponent.tsx` (+ `mapGenerationContext.tsx`, `messages/en.json`, `messages/id.json`)

## Goal

Replace the current two-tab (Own/Default) layout in step 2 with a card-based
picker that navigates into per-flow views, unify confirmation into a single
"Confirm LULC Class" button for both flows, and revive the "Try EPISTEM-AI
Recommendation" section at the bottom. Both major sections are collapsible.

## Layout

The step renders two stacked sections:

1. **Land Use/Cover Hierarchy** — white card, `border-neutral-400`,
   rounded 12px. Header row is a Collapsible trigger (chevron rotates); open
   by default. Collapsing hides the body in every view.
2. **Try EPISTEM-AI Recommendation** — gradient-bordered card (`bg-aneh`
   wrapper, as in the previously commented-out block). Collapsible; collapsed
   by default.

The existing "Reset input" link and the step footer (Back / Next) stay below,
unchanged except for the new Next gating described in §Confirmation.

## Hierarchy section — views

View state: `"picker" | "own" | "default"`, local `useState` in
`DefineLUCComponent`, initialized from `lucSource` on mount
(`"default"` → default flow, `"quick"`/`"excel"` → own flow, `""` → picker).
The back control only changes the view; it never clears entered data
("Reset input" keeps that job).

### Picker view

Section title "Land Use/Cover Hierarchy" + description, then two
side-by-side clickable cards:

- **Own Classification** — circled `+` icon, top-right `>` chevron, caption.
- **Default Classification** — list icon, top-right `>` chevron, caption.

Clicking a card switches the view. Old tab-disable rules carry over as
card-disable rules (greyed, unclickable):

- Default card disabled when `selectedCustom` is true or
  `spatialResolution !== "100"`.
- Own card disabled when `selectedDefault` is true.

### Flow views (shared chrome)

Header row becomes: `‹` back button (left) · pink centered
"Land Use/Cover Hierarchy" title · collapse chevron (right).
Below it, a flow identity block: the flow's icon + flow name
("Own Classification" / "Default Classification") + caption.

### Own Classification flow

- Pill-style filled tabs (same style as the current outer Tabs):
  **"Manual Input"** (was "Quick Table") and **"Upload Classes"**
  (was "Excel Template"). The current line-variant styling is replaced.
- Tab contents are the existing Quick Table and Excel upload UIs, unchanged
  (dropzone, template download, parsed-rows merge, pencil edit toggle,
  duplicate-name validation, uploaded-file preview card).
- Bottom-right: **Confirm LULC Class** button (see §Confirmation).

### Default Classification flow

- Existing description + Vegetation / Non-Vegetation accordions with
  switches, unchanged.
- Bottom-right: **Confirm LULC Class** button.

## Confirmation (single-step, both flows)

The two-phase Lock → Confirm button is removed; `lucQuickPhase` no longer
enters `"locked"` (the type value may remain but is unused).

- **Own:** button disabled until at least one row has a non-empty name and
  there are no duplicate names (`canLockQuick` logic reused). Clicking sets
  `lucQuickPhase = "confirmed"` and `lucExcelConfirmed = true`, and exits
  table edit mode.
- **Default:** button disabled until `defaultArray.length > 0`. Clicking sets
  a **new context flag `lucDefaultConfirmed`** (in `MapGenerationContext`,
  default `false`). Toggling any switch after confirming resets it to
  `false`. `onResetInput` also resets it.

### Confirmed summary view (both flows)

After confirming, the Hierarchy body is replaced by the existing
"X Class Recorded" summary table (No / LULC Class / Color Class). For the
default flow the rows are built from `defaultArray` mapped through
`DEFAULT_LUC` (id order, name, color). The uploaded-file preview card still
shows beneath the summary for the excel path.

The pencil (edit) icon returns to the corresponding flow view
(own → editable table with edit mode on, default → accordion view) and
clears the confirmed flag(s), which disables Next until re-confirmed.

### Next button gating (DefineLUCFooter)

- `quick` source: unchanged — requires `lucQuickPhase === "confirmed"` and
  no duplicates.
- `excel` source: unchanged — requires `lucExcelConfirmed`.
- `default` source: **new** — requires `lucDefaultConfirmed` in addition to
  `defaultArray.length > 0`.

All submit logic in `onClickNext` is unchanged.

## EPISTEM-AI section

Revives the commented-out block using existing `defineLUC.tryAI*` i18n keys:

- Header: sparkle icon (`/images/shimmer.svg`) + "Try EPISTEM-AI
  Recommendation" title + chevron; Collapsible, **collapsed by default**.
- "This feature is coming soon" pill (`ComingSoon`) always visible, even
  collapsed.
- Expanded content: an **enabled** Textarea (user can type; `maxLength=500`;
  value held in local state, not submitted anywhere), "Max 500 character"
  helper text on the left, and a permanently **disabled Go** button on the
  right.

## i18n

New/changed keys in both `messages/en.json` and `messages/id.json`:

- Card captions for Own / Default Classification (placeholder copy until
  final text is provided).
- Tab renames: "Manual Input", "Upload Classes".
- Back control accessible label (if needed).
- Go button label / max-500 helper (reuse existing `tryAI*` keys where they
  fit; adjust text to "Go" and "Max 500 character").

## Out of scope

- Any backend/API changes (Go button does nothing; feature is coming soon).
- Persisting the AI textarea.
- Changes to steps 1/3+, markers, or submit payloads.

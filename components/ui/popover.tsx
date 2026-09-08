import * as React from "react";
import DsPopoverRaw, {
  POPOVER_SECTION,
  POPOVER_ITEM,
  POPOVER_ITEM_DANGER,
  POPOVER_HEADER,
} from "@ds/components/molecules/Popover";

// Cast: the DS component is plain JSX (no TypeScript), TS over-infers required props from it.
const Popover = DsPopoverRaw as React.ComponentType<any>;

export { Popover, POPOVER_SECTION, POPOVER_ITEM, POPOVER_ITEM_DANGER, POPOVER_HEADER };
export default Popover;

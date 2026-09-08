import * as React from "react";
import DsProgressRaw from "@ds/components/molecules/Progress";

const DsProgress = DsProgressRaw as React.ComponentType<any>;

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

/** Adapter over the Asimetrix DS Progress (variant="bar"). `max` is normalized to 0-100. */
function Progress({ value = 0, max = 100, className, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return <DsProgress variant="bar" value={percentage} className={className} {...props} />;
}

export { Progress };

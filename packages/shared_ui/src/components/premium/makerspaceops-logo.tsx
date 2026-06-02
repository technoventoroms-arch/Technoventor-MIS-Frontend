import { cn } from "@mono/shared_ui/lib/utils";
import {
  MAKERSPACE_OPS_LOGO_ALT,
  MAKERSPACE_OPS_LOGO_CLASS,
  MAKERSPACE_OPS_LOGO_SRC,
} from "@mono/shared_ui/lib/brand";

type MakerSpaceOpsLogoProps = {
  className?: string;
  /** Larger mark for auth/marketing panels */
  variant?: "default" | "hero";
};

export function MakerSpaceOpsLogo({ className, variant = "default" }: MakerSpaceOpsLogoProps) {
  return (
    <img
      src={MAKERSPACE_OPS_LOGO_SRC}
      alt={MAKERSPACE_OPS_LOGO_ALT}
      className={cn(
        variant === "hero"
          ? "h-20 w-auto max-w-[280px] object-contain object-left"
          : MAKERSPACE_OPS_LOGO_CLASS,
        className
      )}
    />
  );
}

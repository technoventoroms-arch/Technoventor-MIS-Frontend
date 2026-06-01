import { cn } from "@mono/shared_ui/lib/utils";
import {
  TECHNOVENTOR_LOGO_ALT,
  TECHNOVENTOR_LOGO_CLASS,
  TECHNOVENTOR_LOGO_SRC,
} from "@mono/shared_ui/lib/brand";

type TechnoventorLogoProps = {
  className?: string;
  /** Larger mark for auth/marketing panels */
  variant?: "default" | "hero";
};

export function TechnoventorLogo({ className, variant = "default" }: TechnoventorLogoProps) {
  return (
    <img
      src={TECHNOVENTOR_LOGO_SRC}
      alt={TECHNOVENTOR_LOGO_ALT}
      className={cn(
        variant === "hero"
          ? "h-20 w-auto max-w-[280px] object-contain object-left"
          : TECHNOVENTOR_LOGO_CLASS,
        className
      )}
    />
  );
}

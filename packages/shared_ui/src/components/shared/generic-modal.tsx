import { Check, Info, Loader, Trash, X } from "lucide-react";
import { JSX, ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type variant = "success" | "danger" | "info";
type Props = {
  onOpenChange: (e: boolean) => void;
  open: boolean;
  onConfirmClick: () => void;
  loading?: boolean;
  title: string;
  desc: ReactNode;
  variant?: variant;
  confirmButtonText?: string;
  descAsChild?: boolean;
  disableConfirm?: boolean;
  showConfirmBtn?: boolean;
  customIcon?: JSX.Element;
};

const ButtonVariants: Record<
  variant,
  { theme: string; Icon: () => JSX.Element }
> = {
  success: {
    theme: "green",
    Icon: () => <Check />,
  },
  danger: {
    theme: "red",
    Icon: () => <Trash />,
  },
  info: {
    theme: "indigo",
    Icon: () => <Info />,
  },
};
const GenericModal = ({
  onOpenChange,
  onConfirmClick,
  open,
  desc,
  title,
  loading,
  variant = "success",
  confirmButtonText = "Confirm",
  descAsChild = false,
  disableConfirm = false,
  customIcon,
  showConfirmBtn = true,
}: Props) => {
  const { Icon, theme } = ButtonVariants[variant];
  return (
    <Dialog open={open} onOpenChange={(e) => !loading && onOpenChange(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild={descAsChild}>{desc}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex gap-2 justify-center">
            <Button
              disabled={loading}
              onClick={() => onOpenChange(false)}
              variant={"outline"}
            >
              <X /> Cancel
            </Button>
            {showConfirmBtn && (
              <Button
                disabled={loading || disableConfirm}
                variant={theme as any}
                onClick={onConfirmClick}
              >
                {loading ? (
                  <Loader className="animate-spin" />
                ) : (
                  <>
                    {customIcon || <Icon />}
                    {confirmButtonText}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenericModal;

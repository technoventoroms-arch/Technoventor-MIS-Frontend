import { MachineBookingSummary } from "@/interfaces/reservation";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import { IEvent } from "@mono/shared_ui/components/shared/event-calendar/index";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  event: IEvent<MachineBookingSummary>;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (data: any) => void;
};

const CancelReservation = ({ event, isOpen, onClose, onDelete }: Props) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      notes: "",
    } as any,

    resolver: zodResolver(
      z.object({
        notes: z
          .string({
            required_error: "Please provide reason for cancelling reservation.",
          })
          .min(1)
          .max(100, `Reason can't be more than 100 characters.`),
      }),
    ) as any,
  });

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onDelete(data);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isOpen) {
      form.reset({ notes: "" });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormProvider {...form}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Reservation</DialogTitle>
            <DialogDescription className="sr-only">
              delete the reservation
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
            id="delete-form"
          >
            <span className="flex gap-2 flex-wrap">
              Are you sure you want to delete the reservation from{" "}
              {event?.meta?.booked_from && (
                <Badge variant={"yellow"}>
                  {format(event?.meta?.booked_from, "PPP hh:mm aa")}
                </Badge>
              )}
              to
              {event?.meta?.booked_till && (
                <Badge variant={"yellow"}>
                  {format(event?.meta?.booked_till, "PPP hh:mm aa")}
                </Badge>
              )}
              for the project
              {<Badge variant={"blue"}>{event?.meta?.project_title}</Badge>}
            </span>
            <div className="*:not-first:mt-1.5">
              <ControlledFormTextArea
                name="notes"
                control={form.control}
                label="Reason"
              />
            </div>
          </form>
          <DialogFooter className="flex-row sm:justify-between">
            <div className="flex flex-1 justify-end gap-2">
              <Button disabled={loading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={loading || !form.formState.isDirty}
                form="delete-form"
              >
                {loading ? <Loader className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
};

export default CancelReservation;

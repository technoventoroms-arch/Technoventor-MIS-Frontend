import { MachineBookingSummary } from "@/interfaces/reservation";
import { useLabContext } from "@/providers/lab-provider";
import { getProjectsList } from "@/services/projects.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import ControlledTimePickerV1 from "@mono/shared_ui/components/controlled-form-component/c-time-picker-v1";
import { EventDialogProps } from "@mono/shared_ui/components/shared/event-calendar/index";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { addMinutes, subMinutes } from "date-fns";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface SlotLimits {
  minDate?: Date;
  maxDate?: Date;
  minHour?: number;
  minMinute?: number;
  maxHour?: number;
  maxMinute?: number;
  sameDay?: boolean;
}

const schema = z.object({
  notes: z
    .string()
    .max(255, `Notes can't be more than 255 characters`)
    .optional(),
  project: z
    .object({}, { invalid_type_error: "Project is required." })
    .passthrough()
    .required(),
  start: z.date({ required_error: "Start date is required." }),
  end: z.date({ required_error: "End date is required." }),
});

function ReserveMachineDialog({
  event,
  isOpen,
  onClose,
}: EventDialogProps<MachineBookingSummary>) {
  const { labData } = useLabContext();
  const [projects, setProjects] = useState<DataWithLoading<IProjectsGetAll[]>>({
    data: [],
    loading: false,
  });
  const [slotLimits] = useState<SlotLimits>({});
  const form = useForm({
    defaultValues: {
      notes: "",
      start: event ? new Date(event.startDate) : null,
      end: null,
      project: null,
    } as any,
    disabled: true,
    resolver: zodResolver(schema) as any,
  });
  const fromDate = useWatch({ control: form.control, name: "start" });
  const getProjects = async (e: string) => {
    setProjects({ data: [], loading: true });
    try {
      const res = await getProjectsList({
        lab_id: labData!.lab_id,
        searchQuery: e,
      });
      if (!res.error) {
        setProjects({ data: res.data.records || [], loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setProjects({ data: [], loading: true });
    }
  };

  const meta = event?.meta;

  useEffect(() => {
    if (event) {
      if (event.id) {
        form.reset({
          notes: event.description,
          start: event.meta?.booked_from
            ? new Date(event.meta?.booked_from)
            : null,
          end: event.meta?.booked_till
            ? new Date(event.meta?.booked_till)
            : null,
          project: {
            id: event.meta?.project_id,
            title: event.meta?.project_title,
          },
        });
      }
    }
  }, [event]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormProvider {...form}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {event?.id ? "View Reservation" : "Reserve Machine"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {event?.id
                ? "View the details of this Reservation"
                : "Add a new reservation for the machine"}
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 py-4" id="reserve-form">
            {meta && (
              <div className="*:not-first:mt-1.5">
                <div className="text-sm font-semibold">Reserved By</div>
                <div className="flex gap-2 items-center w-max">
                  <Avatar className="size-8 rounded-full">
                    <AvatarImage
                      src={(meta?.created_by as any)?.avatar}
                      alt={meta?.created_by?.first_name}
                    />
                    <AvatarFallback className="rounded-lg uppercase text-xs">
                      {meta.created_by?.first_name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-sm font-medium">
                      {meta.created_by?.first_name}
                    </span>
                    <span className="truncate text-sm">
                      {meta.created_by?.email}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="*:not-first:mt-1.5">
              <ControlledAutocomplete
                control={form.control}
                name={"project"}
                label={"Project"}
                loading={projects.loading}
                options={projects.data}
                onDebouncedChange={getProjects}
                getItemLabel={(e) => e.title}
                getItemValue={(e) => `${e.id}`}
                emptyText={"No Projects found."}
                formItemClassName="h-auto"
                showClearBtn={!event?.id}
              />
            </div>
            <div className="*:not-first:mt-1.5">
              <ControlledTimePickerV1
                control={form.control}
                name={"start"}
                label={"Start Time"}
                datePickerProps={{
                  fromDate: new Date(),
                  disabled: true,
                }}
                minLimit={slotLimits.minDate}
                maxLimit={
                  slotLimits.maxDate && subMinutes(slotLimits.maxDate, 15)
                }
                onTimeSelect={(time) => {
                  form.setValue("end", addMinutes(time, 15));
                }}
              />
            </div>
            <div className="*:not-first:mt-1.5">
              <ControlledTimePickerV1
                control={form.control}
                name={"end"}
                label={"End Time"}
                datePickerProps={{
                  fromDate: fromDate || new Date(),
                  toDate: slotLimits.maxDate,
                }}
                minLimit={
                  fromDate ? addMinutes(fromDate, 15) : slotLimits.minDate
                }
                maxLimit={slotLimits.maxDate}
              />
            </div>
            <div className="*:not-first:mt-1.5">
              <ControlledFormTextArea
                name="notes"
                control={form.control}
                label="Notes"
              />
            </div>
          </form>
          <DialogFooter className="flex-row sm:justify-between">
            <div className="flex flex-1 justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
}
export default ReserveMachineDialog;

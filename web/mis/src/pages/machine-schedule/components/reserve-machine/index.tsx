import CanIUse from "@/components/shared/can-i-use";
import { MachineBookingSummary } from "@/interfaces/reservation";
import { getEarliestReservationSlotForMachine } from "@/services/machine.service";
import { getProjectsList } from "@/services/projects.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import ControlledTimePickerV1 from "@mono/shared_ui/components/controlled-form-component/c-time-picker-v1";

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
import {
  addMinutes,
  getHours,
  getMinutes,
  isAfter,
  isSameDay,
  subMinutes,
} from "date-fns";
import { Loader, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { EventDialogProps } from "@mono/shared_ui/components/shared/event-calendar/index";

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
  onSave,
  onDelete,
  overRideReservation = null,
  title = "",
  disableStartTimeSelect = false,
}: EventDialogProps<MachineBookingSummary> & {
  overRideReservation?: React.ReactNode;
  title?: string;
  disableStartTimeSelect?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const machineId = Math.abs(Number.parseInt(param.machineId || ""));
  const [projects, setProjects] = useState<DataWithLoading<IProjectsGetAll[]>>({
    data: [],
    loading: false,
  });
  const [slotLimits, setSlotLimits] = useState<SlotLimits>({});
  const form = useForm({
    defaultValues: {
      notes: "",
      start: event ? new Date(event.startDate) : null,
      end: null,
      project: null,
    } as any,
    disabled: !!(event?.meta && event?.meta?.status !== "NEW"),
    resolver: zodResolver(schema) as any,
  });
  const fromDate = useWatch({ control: form.control, name: "start" });
  const getProjects = async (e: string) => {
    setProjects({ data: [], loading: true });
    try {
      const res = await getProjectsList({
        searchQuery: e,
        isComplete: false,
      });
      if (!res.error) {
        setProjects({ data: res.data.records || [], loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setProjects({ data: [], loading: true });
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSave({
        endDate: data.end,
        startDate: data.start,
        id: null as any,
        title: "",
        description: data.notes,
        meta: { project_id: data.project.id },
      } as any);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const meta = event?.meta;

  const handleCancelRequest = async () => {
    if (!event?.id) return;
    setLoading(true);
    try {
      await onDelete(event as any);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleDateSelect = async () => {
    const fromDate = event?.meta?.booked_from
      ? new Date(event.meta?.booked_from)
      : event?.startDate
        ? new Date(event.startDate)
        : null;

    try {
      if (fromDate) {
        const res = await getEarliestReservationSlotForMachine({
          machineId: machineId,
          from: (fromDate as Date).toISOString(),
        });

        if (!res.error) {
          const minHour = getHours(res.data.slot_start);
          const minMinute = getMinutes(res.data.slot_start);
          let minDate = new Date(res.data.slot_start);
          const maxHour = getHours(res.data.slot_end);
          const maxMinute = getMinutes(res.data.slot_end);
          const maxDate = new Date(res.data.slot_end);
          const sameDay = isSameDay(res.data.slot_start, res.data.slot_end);

          setSlotLimits({
            minDate,
            maxDate,
            minHour,
            minMinute,
            maxHour,
            maxMinute,
            sameDay,
          });
          if (
            event &&
            event?.startDate > minDate &&
            maxDate > event?.startDate
          ) {
            minDate = event.startDate;
          }

          if (event && maxDate >= addMinutes(minDate, 15)) {
            const temp = addMinutes(minDate, 15);
            temp.setMinutes(Math.ceil(temp.getMinutes() / 15) * 15, 0, 0);
            form.setValue("end", temp);
          } else {
            form.setValue("end", maxDate);
          }
        }
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    if (event) {
      if (event.id) {
        const endTime = event.meta?.booked_till
          ? new Date(event.meta?.booked_till)
          : null;
        if (endTime) {
          endTime.setMinutes(Math.ceil(endTime.getMinutes() / 15) * 15, 0, 0);
        }
        form.reset(
          {
            notes: event.description,
            start: event.meta?.booked_from
              ? new Date(event.meta?.booked_from)
              : null,
            end: endTime,
            project: {
              id: event.meta?.project_id,
              title: event.meta?.project_title,
            },
          },
          {
            keepDirty: false,
            keepErrors: false,
          },
        );
      } else {
        form.reset({
          notes: "",
          start: event ? new Date(event.startDate) : null,
          end: null,
          project: null,
        });
        handleDateSelect();
      }
    }
  }, [event]);

  const isFutureEvent = useMemo(() => {
    if (meta?.id) {
      return isAfter(meta.booked_from, new Date());
    }
    return false;
  }, []);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormProvider {...form}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {title || (event?.id ? "View Reservation" : "Reserve Machine")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {event?.id
                ? "View the details of this Reservation"
                : "Add a new reservation for the machine"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
            id="reserve-form"
          >
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
                disabled={disableStartTimeSelect}
                minLimit={slotLimits.minDate}
                maxLimit={
                  slotLimits.maxDate && subMinutes(slotLimits.maxDate, 15)
                }
                onTimeSelect={(time) => {
                  form.setValue("end", addMinutes(time, 15));
                }}
                interval={15}
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
                interval={15}
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
            <div>
              <CanIUse action={(a) => a.APPROVE_MACHINES}>
                {isFutureEvent ? (
                  <Button
                    disabled={loading}
                    onClick={handleCancelRequest}
                    variant={"destructive"}
                  >
                    {loading ? <Loader className="animate-spin" /> : <X />}{" "}
                    Cancel Reservation
                  </Button>
                ) : (
                  overRideReservation
                )}
              </CanIUse>
            </div>
            <div className="flex flex-1 justify-end gap-2">
              <Button disabled={loading} variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                disabled={loading || !form.formState.isDirty}
                form="reserve-form"
              >
                {loading ? <Loader className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
}
export default ReserveMachineDialog;

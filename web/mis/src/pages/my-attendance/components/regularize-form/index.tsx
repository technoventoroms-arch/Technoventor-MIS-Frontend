import { IAttendance } from "@/interfaces/attendance";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledTimePickerV1 from "@mono/shared_ui/components/controlled-form-component/c-time-picker-v1";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerFooter } from "@mono/shared_ui/components/ui/drawer";
import { Form } from "@mono/shared_ui/components/ui/form";
import { endOfDay, intervalToDuration, startOfDay } from "date-fns";
import { Loader } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { regularizeSchema, RegularizeSchemaType } from "../../schema";

type Props = {
  handleSubmit: (data: RegularizeSchemaType) => void;
  defaultValues?: Partial<IAttendance>;
  loading?: boolean;
  editMode?: boolean;
};

const RegularizeForm = ({
  handleSubmit,
  defaultValues,
  loading,
  editMode,
}: Props) => {
  const form = useForm<RegularizeSchemaType>({
    defaultValues: {
      check_in_at: defaultValues?.check_in_at
        ? new Date(defaultValues?.check_in_at)
        : new Date(),
      check_out_at: defaultValues?.check_out_at
        ? new Date(defaultValues?.check_out_at)
        : new Date(),
    },
    resolver: zodResolver(regularizeSchema),
    disabled: loading,
  });
  const { isDirty } = form.formState;

  const [checkIn, checkOut] = useWatch({
    control: form.control,
    name: ["check_in_at", "check_out_at"],
  });

  const clockedTime = useMemo(() => {
    if (checkOut && checkIn) {
      return intervalToDuration({
        end: checkOut,
        start: checkIn,
      });
    }
  }, [checkIn, checkOut]);

  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-8 flex-1 overflow-auto"
      >
        <div className="space-y-4">
          <ControlledTimePickerV1
            control={form.control}
            name={"check_in_at"}
            label={"Enter Check-in Time"}
            datePickerProps={{
              toDate: checkOut!,
              disabled: editMode,
            }}
            minLimit={startOfDay(checkIn!)}
            maxLimit={checkOut!}
          />
          <ControlledTimePickerV1
            control={form.control}
            name={"check_out_at"}
            label={"Enter Check-out Time"}
            datePickerProps={{
              fromDate: checkIn!,
              disabled: editMode,
            }}
            minLimit={checkIn!}
            maxLimit={endOfDay(checkOut!)}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm">Clocked Hours</div>
          <Badge>
            {clockedTime ? (
              <>
                {clockedTime.days ? `${clockedTime.days} days - ` : null}
                {`${`${clockedTime.hours || "00"}`.padStart(2, "0")}:${`${
                  clockedTime.minutes || "00"
                }`.padStart(2, "0")}`}
              </>
            ) : (
              "00:00:00"
            )}
          </Badge>
        </div>
      </form>
      <DrawerFooter>
        <Button
          form="project-form"
          disabled={loading || !isDirty}
          type="submit"
          variant={"green"}
        >
          {loading ? <Loader className="animate-spin" /> : "Submit"}
        </Button>
      </DrawerFooter>
    </Form>
  );
};

export default RegularizeForm;

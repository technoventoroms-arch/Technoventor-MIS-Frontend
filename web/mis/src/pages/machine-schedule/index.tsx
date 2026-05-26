import { routeConstants } from "@/constants/route.constants";
import { IMachine } from "@/interfaces/machines";
import {
  IMachineReservationQueryParams,
  MachineBookingSummary,
} from "@/interfaces/reservation";
import {
  addMachineReservation,
  cancelMachineReservations,
  getMachineById,
  getMachineReservations,
  updateMachineReservations,
} from "@/services/machine.service";
import { CalendarProvider } from "@mono/shared_ui/components/shared/event-calendar/contexts/calendar-context";
import { ClientContainer } from "@mono/shared_ui/components/shared/event-calendar/components/client-container";

import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  DataWithLoading,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ReserveMachineDialog from "./components/reserve-machine";

import { useLabContext } from "@/providers/lab-provider";
import { IEvent } from "../../../../../packages/shared_ui/src/components/shared/event-calendar/interfaces";
import CancelReservation from "./components/cancel-reservation";
import OverRideReservation from "./components/over-ride-reservation";
import { isInCurrentSlot } from "@mono/shared_ui/components/shared/event-calendar/index";

const MachineSchedule = () => {
  const { baseUrl } = useLabContext();

  const [machineDetails, setMachineDetails] = useState<
    DataWithLoading<IMachine | null>
  >({ data: null, loading: false });
  const param = useParams();
  const [loading, setLoading] = useState(false);
  const machineId = Math.abs(Number.parseInt(param.machineId || ""));
  const [events, setEvents] = useState<IEvent<MachineBookingSummary>[]>([]);

  const [deleteReservationModal, setDeleteCategoryModal] =
    useState<IEvent<MachineBookingSummary> | null>(null);
  const [cancelReservationModal, setCancelReservationModal] =
    useState<IEvent<MachineBookingSummary> | null>(null);

  const [addReservationModal, setAddReservationModal] =
    useState<IEvent<MachineBookingSummary> | null>(null);
  const [bookNowReservationModal, setBookNowReservationModal] =
    useState<IEvent<MachineBookingSummary> | null>(null);
  const [viewReservationModal, setViewReservationModal] =
    useState<IEvent<MachineBookingSummary> | null>(null);

  const [fetchedEventsIds, setFetchedEventsIds] = useState<Set<number>>(
    new Set(),
  );
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const [disabledDates, setDisabledDates] = useState<Set<string>>(new Set());

  const buildEventTimeline = (
    element: any,
    eventArray: IEvent<MachineBookingSummary>[],
    idsSet: Set<number>,
    tempDisableDates: Set<string>,
  ) => {
    if (!fetchedEventsIds.has(element.id)) {
      idsSet.add(element.id);
      const dates = eachDayOfInterval({
        start: element.booked_from,
        end: element.booked_till,
      });
      const color = [
        "blue",
        "green",
        "red",
        "yellow",
        "purple",
        "orange",
        "gray",
      ][Math.floor(Math.random() * 5)] as any;
      if (dates.length > 1) {
        const startDay = dates.shift()!;
        eventArray.push({
          startDate: new Date(element.booked_from),
          endDate: endOfDay(startDay),
          id: element.id.toString(),
          title: element.project_title,
          description: element.notes,
          color: color,
          meta: element,
        });
        const endDay = dates.pop()!;
        eventArray.push({
          startDate: startOfDay(endDay),
          endDate: new Date(element.booked_till),
          id: element.id.toString(),
          title: element.project_title,
          description: element.notes,
          color: color,
          meta: element,
        });
        dates.forEach((i) => {
          tempDisableDates.add(i.toISOString());
          eventArray.push({
            startDate: startOfDay(i),
            endDate: endOfDay(i),
            id: element.id.toString(),
            title: element.project_title,
            description: element.notes,
            color: color,
            meta: element,
          });
        });
      } else {
        eventArray.push({
          startDate: new Date(element.booked_from),
          endDate: new Date(element.booked_till),
          id: element.id.toString(),
          title: element.project_title,
          description: element.notes,
          color: color,
          meta: element,
        });
      }
    }
  };
  const fetchMachineReserVations = async (
    payload: IMachineReservationQueryParams,
  ) => {
    setLoading(true);
    try {
      const data = await getMachineReservations(
        Math.abs(Number.parseInt(param.machineId || "")),
        payload,
      );

      if (!data.error) {
        const temp = [...events];
        data.data.records = data?.data?.records || [];
        const idsSet = new Set(fetchedEventsIds);
        const tempDisableDates = new Set(disabledDates);
        for (let index = 0; index < data?.data?.records.length; index++) {
          const element = data?.data?.records[index];
          buildEventTimeline(element, temp, idsSet, tempDisableDates);
        }
        setEvents(temp);

        setFetchedEventsIds(idsSet);
        const tempSet = new Set(fetchedMonths);
        tempSet.add(`${payload.from}-${payload.to}`);
        setFetchedMonths(tempSet);
        setDisabledDates(tempDisableDates);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
    setLoading(false);
  };

  const handleEventAdd = async (event: IEvent<MachineBookingSummary>) => {
    try {
      const res = await addMachineReservation({
        booked_from: event.startDate.toISOString(),
        booked_till: event.endDate.toISOString(),
        notes: event.description || "",
        machine_id: machineId,
        project_id: event.meta!.project_id,
        isCurrent:
          !!bookNowReservationModal || isInCurrentSlot(event.startDate),
      });
      if (!res.error) {
        const temp = [...events];
        const idsSet = new Set(fetchedEventsIds);
        const tempDisableDates = new Set(disabledDates);

        buildEventTimeline(
          {
            ...res.data,
            project_title: res.data.project.title,
            project_description: res.data.project.description,
            project_id: res.data.project.id,
          },
          temp,
          idsSet,
          tempDisableDates,
        );

        setEvents(temp);
        setFetchedEventsIds(idsSet);
        const tempSet = new Set(fetchedMonths);
        setFetchedMonths(tempSet);
        setDisabledDates(tempDisableDates);
        setAddReservationModal(null);
        setBookNowReservationModal(null);
      }
      toast.success("You request has been successfully registered.");
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  const onDeleteReservation = (event: IEvent<MachineBookingSummary>) => {
    setDeleteCategoryModal(event);
  };
  const handleEventDelete = async (data: any) => {
    if (!deleteReservationModal) return;
    const id = deleteReservationModal.id;

    try {
      const res = await updateMachineReservations(
        deleteReservationModal.meta!.project_id!,
        deleteReservationModal.meta!.id,
        "REJECTED",
        data?.notes,
      );
      if (!res.error) {
        const filter = events.filter((i) => i.id != id);
        toast.success("Request has been successfully deleted.");
        setEvents(filter);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setDeleteCategoryModal(null);
      setViewReservationModal(null);
    }
  };

  const getMachineInfo = async () => {
    setMachineDetails({
      data: null,
      loading: true,
    });
    try {
      const res = await getMachineById(machineId);
      if (!res.error) {
        setMachineDetails({
          data: res.data,
          loading: false,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    getMachineInfo();
  }, []);
  const getMachineReservationsList = async (payload: Date) => {
    const start = startOfWeek(startOfMonth(payload), {
      weekStartsOn: 0,
    }).toISOString();
    const end = endOfWeek(endOfMonth(payload), {
      weekStartsOn: 0,
    }).toISOString();
    if (!fetchedMonths.has(`${start}-${end}`)) {
      await fetchMachineReserVations({
        from: start,
        to: end,
        status: "APPROVED",
      });
    }
  };

  const getEvensForYearView = async (payload: Date[]) => {
    setLoading(true);
    try {
      const allPromises: Promise<
        ResponseDataType<PaginatedData<MachineBookingSummary>, null>
      >[] = [];
      payload.forEach((date) => {
        const start = startOfWeek(startOfMonth(date), {
          weekStartsOn: 0,
        }).toISOString();
        const end = endOfWeek(endOfMonth(date), {
          weekStartsOn: 0,
        }).toISOString();
        if (!fetchedMonths.has(`${start}-${end}`)) {
          allPromises.push(
            getMachineReservations(
              Math.abs(Number.parseInt(param.machineId || "")),
              { from: start, to: end, status: "APPROVED" },
            ),
          );
        }
      });
      if (allPromises.length === 0) {
        setLoading(false);
        return;
      }

      const results = await Promise.all(allPromises);

      const temp = [...events];
      const idsSet = new Set(fetchedEventsIds);
      const tempDisableDates = new Set(disabledDates);
      const tempSet = new Set(fetchedMonths);

      for (let i = 0; i < results.length; i++) {
        const data = results[i];
        if (!data.error) {
          data.data.records = data?.data?.records || [];
          for (let index = 0; index < data?.data?.records.length; index++) {
            const element = data?.data?.records[index];
            buildEventTimeline(element, temp, idsSet, tempDisableDates);
          }

          tempSet.add(`${payload[i].toISOString()}`);
        }
      }
      setEvents(temp);
      setFetchedEventsIds(idsSet);
      setFetchedMonths(tempSet);
      setDisabledDates(tempDisableDates);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
    setLoading(false);
  };
  const handleCancelReservation = async (data: any) => {
    if (!cancelReservationModal) return;
    const id = cancelReservationModal.id;

    try {
      const res = await cancelMachineReservations(
        cancelReservationModal.meta!.id,
        data?.notes,
      );
      if (!res.error) {
        const filter = events.filter((i) => i.id != id);
        toast.success("Reservation has been successfully cancelled.");
        setEvents(filter);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setCancelReservationModal(null);
      setViewReservationModal(null);
    }
  };
  const handleAddNewEventClick = (e: IEvent<any>) => {
    setAddReservationModal(e);
  };
  return (
    <CalendarProvider
      events={events}
      handleCurrentDateChange={getMachineReservationsList}
      handleAddEvent={handleAddNewEventClick}
      handleEditEvent={setViewReservationModal}
      canCreateEvent={true}
      handleGetMonthsEvents={getEvensForYearView}
      loading={loading}
      handleBookNow={setBookNowReservationModal}
    >
      <SiteHeader
        breadCrumbs={[
          {
            title: "Manage Machine",
            url: `/${baseUrl}/${routeConstants.MACHINES}`,
          },
          {
            title: `${machineDetails.data?.name}`,
            url: "",
            loading: machineDetails.loading,
          },
        ]}
      />
      <div className="@container/main flex flex-1 flex-row gap-2 p-2 overflow-hidden">
        <section className="h-full overflow-hidden flex-1">
          <ClientContainer view="month" eventName="Reservations" showBookNow />
        </section>
      </div>
      {addReservationModal && (
        <ReserveMachineDialog
          event={addReservationModal}
          isOpen={!!addReservationModal}
          onClose={() => setAddReservationModal(null)}
          onSave={handleEventAdd}
          onDelete={onDeleteReservation as any}
          allEvents={events}
        />
      )}
      {bookNowReservationModal && (
        <ReserveMachineDialog
          event={bookNowReservationModal}
          isOpen={!!bookNowReservationModal}
          onClose={() => setBookNowReservationModal(null)}
          onSave={handleEventAdd}
          onDelete={onDeleteReservation as any}
          allEvents={events}
          title="Reserve Machine Now"
          disableStartTimeSelect
        />
      )}
      {viewReservationModal && (
        <ReserveMachineDialog
          event={viewReservationModal}
          isOpen={!!viewReservationModal}
          onClose={() => setViewReservationModal(null)}
          onSave={(() => {}) as any} // No need for update in view mode, so we can pass an empty function
          onDelete={onDeleteReservation as any}
          allEvents={events}
          overRideReservation={
            <OverRideReservation
              event={viewReservationModal}
              handleCancelReservation={() =>
                setCancelReservationModal(viewReservationModal)
              }
            />
          }
        />
      )}
      {deleteReservationModal && (
        <CancelReservation
          isOpen={!!deleteReservationModal}
          event={deleteReservationModal}
          onClose={() => setDeleteCategoryModal(null)}
          onDelete={handleEventDelete}
        />
      )}
      {cancelReservationModal && (
        <CancelReservation
          isOpen={!!cancelReservationModal}
          event={cancelReservationModal}
          onClose={() => setCancelReservationModal(null)}
          onDelete={handleCancelReservation}
        />
      )}
    </CalendarProvider>
  );
};

export default MachineSchedule;

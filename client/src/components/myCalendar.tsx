import { Calendar, Views } from "react-big-calendar";
import { localizer } from "../utils/calendarLocalizer";
export type RbcEvent = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
};

export default function MyCalendar({
  events,
  onRangeChange,
  onSelectEvent,
  onSelectSlot,
}: {
  events: RbcEvent[];
  onRangeChange?: (range: { start: Date; end: Date } | Date[]) => void;
  onSelectEvent?: (e: RbcEvent) => void;
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          selectable
          onRangeChange={onRangeChange}
          onSelectEvent={(e: RbcEvent) => onSelectEvent?.(e)}
          onSelectSlot={(slot: { start: Date; end: Date; }) =>
            onSelectSlot?.({ start: slot.start as Date, end: slot.end as Date })
          }
        />
      </div>
    </div>
  );
}

import { Calendar, Views, type View } from "react-big-calendar";
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
  date,
  view,
  onNavigate,
  onView,
  onRangeChange,
  onSelectEvent,
  onSelectSlot,
  workStartTime = '09:00',
  workEndTime = '17:00',
}: {
  events: RbcEvent[];
  date: Date;
  view: View;
  onNavigate: (newDate: Date) => void;
  onView: (view: View) => void;
  onRangeChange?: (range: { start: Date; end: Date } | Date[]) => void;
  onSelectEvent?: (e: RbcEvent) => void;
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
  workStartTime?: string;
  workEndTime?: string;
}) {
  const minTime = new Date();
  minTime.setHours(parseInt(workStartTime.split(':')[0]), parseInt(workStartTime.split(':')[1] || '0'), 0);
  
  const maxTime = new Date();
  maxTime.setHours(parseInt(workEndTime.split(':')[0]), parseInt(workEndTime.split(':')[1] || '0'), 0);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          date={date}
          view={view}
          onNavigate={onNavigate}
          onView={onView}
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          selectable
          min={minTime}
          max={maxTime}
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

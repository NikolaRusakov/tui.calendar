import type {
  EventObject,
  ExternalEventTypes,
  Options,
} from "@toast-ui/calendar";
import ToastUICalendar from "@toast-ui/calendar";
import React, { useRef, useEffect } from "react";

type ReactCalendarOptions = Omit<Options, "defaultView">;
type CalendarView = Required<Options>["defaultView"];

type CalendarExternalEventNames = Extract<keyof ExternalEventTypes, string>;
type ReactCalendarEventNames = `on${Capitalize<CalendarExternalEventNames>}`;
type ReactCalendarEventHandler = ExternalEventTypes[CalendarExternalEventNames];
type ReactCalendarExternalEvents = {
  [events in ReactCalendarEventNames]: ReactCalendarEventHandler;
};

type Props = ReactCalendarOptions & {
  height: string;
  events?: Partial<EventObject>[];
  view?: CalendarView;
  ref: React.RefObject<ToastUICalendar | null>;
} & ReactCalendarExternalEvents;

const optionsProps: (keyof ReactCalendarOptions)[] = [
  "useFormPopup",
  "useDetailPopup",
  "isReadOnly",
  "week",
  "month",
  "gridSelection",
  "usageStatistics",
  "eventFilter",
  "timezone",
  "template",
];

const reactCalendarEventNames: ReactCalendarEventNames[] = [
  "onSelectDateTime",
  "onBeforeCreateEvent",
  "onBeforeUpdateEvent",
  "onBeforeDeleteEvent",
  "onAfterRenderEvent",
  "onClickDayName",
  "onClickEvent",
  "onClickMoreEventsBtn",
  "onClickTimezonesCollapseBtn",
];

const ToastUIReactCalendar: React.FC<Props> = ({
  height = "800px",
  events = [],
  view = "week",
  ref: calendarInstanceRef,
  ...options
}) => {
  const containerElementRef = useRef<HTMLDivElement>(null);
  // const calendarInstanceRef = useRef<ToastUICalendar | null>(null);

  // Initialize calendar
  useEffect(() => {
    const container = containerElementRef.current;
    if (container) {
      calendarInstanceRef.current = new ToastUICalendar(container, {
        usageStatistics: false,
        ...options,
      });
      container.style.height = height;
    }

    return () => {
      calendarInstanceRef.current?.destroy();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Set events when the calendar is initialized or events change
  useEffect(() => {
    if (calendarInstanceRef.current) {
      if (events.length > 0) {
        calendarInstanceRef.current.clear();
        calendarInstanceRef.current.createEvents(events);
      }
    }
  }, [events]);

  // Handle changes to calendars prop
  useEffect(() => {
    if (options.calendars && calendarInstanceRef.current) {
      calendarInstanceRef.current.setCalendars(options.calendars);
    }
  }, [options.calendars]);

  // Handle changes to theme
  useEffect(() => {
    if (options.theme && calendarInstanceRef.current) {
      calendarInstanceRef.current.setTheme(options.theme);
    }
  }, [options.theme]);

  // Handle view changes
  useEffect(() => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.changeView(view);
    }
  }, [view]);

  // Handle height changes
  useEffect(() => {
    if (containerElementRef.current) {
      containerElementRef.current.style.height = height;
    }
  }, [height]);

  // Handle other option changes
  useEffect(() => {
    if (calendarInstanceRef.current) {
      const updatedOptions = optionsProps.reduce(
        (acc, key) => {
          if (options[key] !== undefined) {
            acc[key] = options[key];
          }
          return acc;
        },
        {} as Record<keyof Options, any>,
      );

      if (Object.keys(updatedOptions).length > 0) {
        calendarInstanceRef.current.setOptions(updatedOptions);
      }
    }
  }, [
    options.useFormPopup,
    options.useDetailPopup,
    options.isReadOnly,
    options.week,
    options.month,
    options.gridSelection,
    options.usageStatistics,
    options.eventFilter,
    options.timezone,
    options.template,
  ]);

  // Bind event handlers
  useEffect(() => {
    const calendar = calendarInstanceRef.current;
    if (!calendar) return;

    // Unbind existing event handlers
    reactCalendarEventNames.forEach((reactEventName) => {
      const eventName =
        reactEventName[2].toLowerCase() + reactEventName.slice(3);
      calendar.off(eventName);
    });

    // Bind new event handlers
    reactCalendarEventNames.forEach((reactEventName) => {
      if (options[reactEventName]) {
        const eventName =
          reactEventName[2].toLowerCase() + reactEventName.slice(3);
        calendar.on(eventName, options[reactEventName]);
      }
    });
  }, [
    options.onSelectDateTime,
    options.onBeforeCreateEvent,
    options.onBeforeUpdateEvent,
    options.onBeforeDeleteEvent,
    options.onAfterRenderEvent,
    options.onClickDayName,
    options.onClickEvent,
    options.onClickMoreEventsBtn,
    options.onClickTimezonesCollapseBtn,
  ]);

  // Expose methods using React refs
  // React.useImperativeHandle(
  //   // containerElementRef,
  //   calendarInstanceRef,
  //   // React.forwardRef((props, ref) => ref),
  //   () => ({
  //     getInstance: () => calendarInstanceRef.current,
  //     getRootElement: () => containerElementRef.current,
  //   }),
  // );
  return <div className="container" ref={containerElementRef} />;
};

export default ToastUIReactCalendar;


type CalendarEvent = {
  title: string,
  start: Date,
  end: Date,
  created: Date,
  id: string,
  description?: string,
  location?: string,
  cancelled?: boolean
}

type CalendarOptions = {
  minimumDuration?: number
}

class Calendar {
  private minimumDuration: number = 5 * 60000 // 5 minutes
  private events: CalendarEvent[] = []
  private prodID: string;
  private ics: string = "";
  constructor(id: string, opts?: CalendarOptions) {
    this.prodID = id;
    this.icsInsert("begin", "VCALENDAR");
    this.icsInsert("version", "2.0");
    this.icsInsert("prodid", this.prodID);
  }

  private calculateStart(start: Date, end: Date) {
    if (end.getTime() == start.getTime()) {
      return new Date(end.getTime() - this.minimumDuration);
    } else {
      return start;
    }
  }

  public addEvent(event: CalendarEvent) {
    this.events.push(event);
    this.icsInsert("begin", "VEVENT");
    this.icsInsert("uid", event.id);
    this.icsInsert("dtstamp", event.created);
    this.icsInsert("dtstart", this.calculateStart(event.start, event.end))
    this.icsInsert("dtend", event.end);
    this.icsInsert("summary", event.title);
    if (event.description) {
      this.icsInsert("description", event.description)
    }
    if (event.location) {
      this.icsInsert("location", event.location);
    }
    if (event.cancelled) {
      this.icsInsert("status", "CANCELLED");
    }
    this.icsInsert("end", "VEVENT");
  }

  private toICSDateString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }


  public icsInsert(key: string, value: string | Date, last?: boolean) {
    this.ics += `${key.toUpperCase()}:${typeof value === "string" ? value : this.toICSDateString(value)}${last ? "" : "\r\n"}`;
  }

  public generate(): string {
    this.icsInsert("end", "VCALENDAR", true);
    return this.ics;
  }
}

export default Calendar;
import type { CalendarEvent } from "../../types";

interface Props {
  event: CalendarEvent;
  onDone: () => void;
}

export function SuccessSection({ event, onDone }: Props) {
  return (
    <section className="section success-section">
      <div className="success-icon">&#10003;</div>
      <h2>Event Created</h2>
      <p className="success-summary">&ldquo;{event.summary}&rdquo;</p>
      <a
        className="btn btn-primary"
        href={event.htmlLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        View in Google Calendar
      </a>
      <button className="btn btn-secondary" onClick={onDone}>
        Done
      </button>
    </section>
  );
}

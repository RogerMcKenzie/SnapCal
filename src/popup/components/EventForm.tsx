import { useState } from "react";
import type { EventDetails } from "../../types";
import { validateEvent } from "../../lib/utils";

interface Props {
  initial: EventDetails;
  onSubmit: (details: EventDetails) => void;
  onBack: () => void;
}

export function EventForm({ initial, onSubmit, onBack }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.startTime ?? "");
  const [endTime, setEndTime] = useState(initial.endTime ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [isAllDay, setIsAllDay] = useState(initial.isAllDay);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const details: EventDetails = {
      title: title.trim(),
      date,
      startTime: isAllDay ? null : startTime || null,
      endTime: isAllDay ? null : endTime || null,
      location: location.trim() || null,
      description: description.trim() || null,
      isAllDay,
    };

    const validationErrors = validateEvent(details);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSubmitting(true);
    onSubmit(details);
  }

  return (
    <section className="section">
      <h2>Event Details</h2>

      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((err, i) => (
            <p key={i} className="error-msg">
              {err}
            </p>
          ))}
        </div>
      )}

      <form className="event-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
          />
          All-day event
        </label>

        {!isAllDay && (
          <>
            <label>
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label>
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </>
        )}

        <label>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="btn-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Adding…" : "Add to Calendar"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={submitting}
          >
            Back
          </button>
        </div>
      </form>
    </section>
  );
}

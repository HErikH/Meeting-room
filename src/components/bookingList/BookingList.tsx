import type { T_Booking } from "@app-types/booking";
import {
  useBookings,
  useBookingsStatus,
  useBookingsError,
  useDeleteError,
  useDeletingId,
  refreshBookings,
  useIsMutating,
} from "@/store";
import {
  formatLocalDate,
  localTimeInMinutes,
  timeToMinutes,
} from "@utils/dateTime";
import { useNow } from "@hooks/useNow";
import "./style.scss";

type T_Props = {
  editingId?: string;
  onEdit: (booking: T_Booking) => void;
  onDelete: (booking: T_Booking) => void;
};

export function BookingList({ editingId, onEdit, onDelete }: T_Props) {
  const bookings = useBookings();
  const status = useBookingsStatus();
  const error = useBookingsError();
  const deleteError = useDeleteError();
  const deletingId = useDeletingId();
  const isMutating = useIsMutating();

  return (
    <section
      className="panel booking-list"
      aria-labelledby="list-heading"
      aria-busy={status === "loading"}
    >
      <div className="booking-list__header">
        <h2 className="booking-list__heading" id="list-heading">
          Bookings{" "}
          <span className="booking-list__count">{bookings.length}</span>
        </h2>
        <button
          className="button"
          type="button"
          disabled={isMutating || status === "loading"}
          onClick={() => void refreshBookings()}
        >
          Refresh
        </button>
      </div>
      {(status === "idle" || status === "loading") && (
        <p className="booking-list__status" role="status">
          {bookings.length ? "Updating bookings…" : "Loading bookings…"}
        </p>
      )}
      {error && (
        <div className="notice notice--error" role="alert">
          <p>
            {error}{" "}
            {bookings.length > 0 && "Displayed bookings may be out of date."}
          </p>
          <button
            className="booking-list__retry button"
            type="button"
            disabled={isMutating}
            onClick={() => void refreshBookings()}
          >
            Retry loading
          </button>
        </div>
      )}
      {deleteError && (
        <p className="notice notice--error" role="alert">
          {deleteError}
        </p>
      )}
      {status === "success" && bookings.length === 0 && (
        <p className="booking-list__empty">No bookings for this date.</p>
      )}
      <ul className="booking-list__items">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className={
              editingId === booking.id
                ? "booking-item booking-item--editing"
                : "booking-item"
            }
          >
            <div className="booking-item__details">
              <p className="booking-item__time">
                <time>{booking.start}</time>–<time>{booking.end}</time>
              </p>
              <p className="booking-item__title">
                {booking.title || "Untitled booking"}
              </p>
              {editingId === booking.id && (
                <span className="booking-item__status">Editing</span>
              )}
            </div>
            <div className="booking-item__actions">
              <EditBookingButton
                booking={booking}
                disabled={isMutating || status !== "success"}
                onEdit={onEdit}
              />
              <button
                className="button button--danger"
                type="button"
                disabled={isMutating || status !== "success"}
                aria-label={`Delete ${booking.title || "booking"} at ${booking.start}`}
                onClick={() => onDelete(booking)}
              >
                {deletingId === booking.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EditBookingButton({
  booking,
  disabled,
  onEdit,
}: {
  booking: T_Booking;
  disabled: boolean;
  onEdit: (booking: T_Booking) => void;
}) {
  const now = useNow();
  const today = formatLocalDate(now);
  const start = timeToMinutes(booking.start) ?? 0;
  const past =
    booking.date < today ||
    (booking.date === today && start < localTimeInMinutes(now));

  return (
    <button
      className="button"
      type="button"
      disabled={disabled || past}
      aria-label={`Edit ${booking.title || "booking"} at ${booking.start}`}
      title={past ? "Past bookings cannot be edited." : undefined}
      onClick={() => onEdit(booking)}
    >
      Edit
    </button>
  );
}

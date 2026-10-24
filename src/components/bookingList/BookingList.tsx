import type { Ref } from "react";
import type { T_Booking } from "@app-types/booking";
import {
  useBookings,
  useBookingsStatus,
  useBookingsError,
  useDeletingId,
  refreshBookings,
  useIsMutating,
  useSelectedDate,
} from "@/store";
import {
  formatLocalDate,
  formatDisplayDate,
  localTimeInMinutes,
  timeToMinutes,
} from "@utils/dateTime";
import { useNow } from "@hooks/useNow";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import { Badge } from "@UI/badge/Badge";
import { Notice } from "@UI/notice/Notice";
import { Skeleton } from "@UI/skeleton/Skeleton";
import { EmptyState } from "@UI/emptyState/EmptyState";
import "./style.scss";

type T_Props = {
  editingId?: string;
  onEdit: (booking: T_Booking) => void;
  onDelete: (booking: T_Booking) => void;
  onCreate: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
};

export function BookingList({
  editingId,
  onEdit,
  onDelete,
  onCreate,
  headingRef,
}: T_Props) {
  const bookings = useBookings();
  const status = useBookingsStatus();
  const error = useBookingsError();
  const deletingId = useDeletingId();
  const isMutating = useIsMutating();
  const date = useSelectedDate();
  const loading = status === "idle" || status === "loading";
  const reservedMinutes = bookings.reduce(
    (total, booking) =>
      total +
      (timeToMinutes(booking.end) ?? 0) -
      (timeToMinutes(booking.start) ?? 0),
    0,
  );

  return (
    <section
      id="schedule"
      className="panel booking-list"
      aria-labelledby="list-heading"
      aria-busy={loading}
    >
      <div className="booking-list__header">
        <div>
          <h2
            ref={headingRef}
            className="booking-list__heading"
            id="list-heading"
            tabIndex={-1}
          >
            Daily schedule <Badge>{bookings.length}</Badge>
          </h2>
          <p className="booking-list__description">
            {formatDisplayDate(date, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          aria-label="Refresh"
          variant="ghost"
          icon={<Icon name="refresh" />}
          loading={loading}
          disabled={isMutating}
          onClick={() => void refreshBookings()}
        >
          <span className="booking-list__refresh-label">Refresh</span>
        </Button>
      </div>
      {error && (
        <Notice
          variant="error"
          className="booking-list__notice"
          title="Couldn’t load the schedule"
          action={
            <Button
              disabled={isMutating}
              onClick={() => void refreshBookings()}
            >
              Retry loading
            </Button>
          }
        >
          {error}
          {bookings.length > 0 && " Displayed bookings may be out of date."}
        </Notice>
      )}
      {loading && bookings.length === 0 && (
        <Skeleton label="Loading bookings…" />
      )}
      {loading && bookings.length > 0 && (
        <p className="sr-only" role="status">
          Updating bookings…
        </p>
      )}
      {status === "success" && bookings.length === 0 && (
        <EmptyState
          title="A little room in your day"
          description="No bookings for this date. Pick a time and make the space yours."
          action={
            <Button
              className="booking-list__create"
              variant="ghost"
              icon={<Icon name="plus" />}
              onClick={onCreate}
            >
              Plan a meeting
            </Button>
          }
        />
      )}
      {bookings.length > 0 && (
        <ul className="booking-list__items">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className={`booking-item${editingId === booking.id ? " booking-item--editing" : ""}`}
            >
              <div className="booking-item__time">
                <time>{booking.start}</time>
                <span>to {booking.end}</span>
              </div>
              <div className="booking-item__details">
                <p className="booking-item__title">
                  {booking.title || "Untitled booking"}
                </p>
                <div className="booking-item__meta">
                  <span>
                    <Icon name="clock" />
                    {(timeToMinutes(booking.end) ?? 0) -
                      (timeToMinutes(booking.start) ?? 0)}{" "}
                    min
                  </span>
                  <Badge
                    variant={editingId === booking.id ? "primary" : "default"}
                  >
                    {editingId === booking.id ? "Editing" : "Reserved"}
                  </Badge>
                </div>
              </div>
              <div className="booking-item__actions">
                <EditBookingButton
                  booking={booking}
                  disabled={isMutating || status !== "success"}
                  onEdit={onEdit}
                />
                <Button
                  className="booking-item__delete"
                  variant="ghost"
                  iconOnly
                  icon={<Icon name="trash" />}
                  loading={deletingId === booking.id}
                  disabled={isMutating || status !== "success"}
                  aria-label={`Delete ${booking.title || "booking"} at ${booking.start}`}
                  title="Delete booking"
                  onClick={() => onDelete(booking)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="booking-list__footer">
        <span>
          <span className="booking-list__dot" />
          {status === "error"
            ? "Schedule unavailable"
            : loading
              ? "Checking the schedule"
              : bookings.length
                ? `${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} scheduled`
                : "Your next meeting starts here"}
        </span>
        {status === "success" && bookings.length > 0 && (
          <span>{reservedMinutes} min reserved</span>
        )}
      </div>
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
    <Button
      variant="ghost"
      iconOnly
      icon={<Icon name="edit" />}
      disabled={disabled || past}
      aria-label={`Edit ${booking.title || "booking"} at ${booking.start}`}
      title={past ? "Past bookings cannot be edited." : "Edit booking"}
      onClick={() => onEdit(booking)}
    />
  );
}

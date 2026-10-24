import { useEffect, useRef } from "react";
import { useBookingEditor } from "@hooks/useBookingEditor";
import { refreshBookings, useSelectedDate, useIsMutating } from "@/store";
import { formatDisplayDate } from "@utils/dateTime";
import { focusBookingForm } from "@utils/focusBookingForm";
import { BookingForm } from "@components/bookingForm/BookingForm";
import { BookingList } from "@components/bookingList/BookingList";
import { DateToolbar } from "@components/dateToolbar/DateToolbar";
import { Header } from "@components/header/Header";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import { Notice } from "@UI/notice/Notice";
import { Modal } from "@UI/modal/Modal";
import "./style.scss";

export function BookingPage() {
  const selectedDate = useSelectedDate();
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const isMutating = useIsMutating();
  const editor = useBookingEditor(selectedDate);
  const action = editor.pendingAction;
  const deleting = action?.type === "delete";

  useEffect(() => {
    void refreshBookings();
  }, []);

  return (
    <>
      <Header />
      <main className="booking-page" id="main-content" tabIndex={-1}>
        <div className="booking-page__intro">
          <div>
            <p className="booking-page__eyebrow">
              YOUR WORKSPACE, WELL PLANNED
            </p>
            <h1 className="booking-page__title">
              Room bookings<span>.</span>
            </h1>
            <p className="booking-page__description">
              A shared space. A clear schedule. Better meetings.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Icon name={editor.editingBooking ? "edit" : "plus"} />}
            disabled={isMutating}
            onClick={focusBookingForm}
          >
            {editor.editingBooking ? "Continue editing" : "New booking"}
          </Button>
        </div>
        <section
          className="booking-page__room panel"
          aria-label="Meeting room information"
        >
          <div className="booking-page__room-name">
            <span className="booking-page__room-icon">
              <Icon name="room" />
            </span>
            <div>
              <h2>Meeting room</h2>
              <p>One shared room for your team</p>
            </div>
          </div>
          <dl className="booking-page__room-facts">
            <div>
              <dt>
                <Icon name="clock" />
                Working hours
              </dt>
              <dd>09:00 – 18:00</dd>
            </div>
            <div>
              <dt>
                <Icon name="calendar" />
                Booking duration
              </dt>
              <dd>30 min – 2 hours</dd>
            </div>
          </dl>
        </section>
        <DateToolbar date={selectedDate} onChange={editor.selectDate} />
        <div className="booking-page__notice" aria-live="polite">
          {editor.notice && (
            <Notice variant="success" onDismiss={editor.dismissNotice}>
              {editor.notice}
            </Notice>
          )}
        </div>
        <div className="booking-page__layout">
          <BookingList
            headingRef={listHeadingRef}
            editingId={editor.editingBooking?.id}
            onEdit={editor.editBooking}
            onDelete={editor.removeBooking}
            onCreate={focusBookingForm}
          />
          <BookingForm
            key={`${selectedDate}-${editor.editingBooking?.id ?? "new"}`}
            date={selectedDate}
            booking={editor.editingBooking}
            onDirty={editor.markDirty}
            onCancel={editor.cancelEditing}
            onSaved={editor.finishSaving}
          />
        </div>
        <footer className="booking-page__footer">
          <span>
            <Icon name="globe" />
            All times are local to your device
          </span>
          <span>A little planning goes a long way.</span>
        </footer>
      </main>
      <Modal
        fallbackFocusRef={listHeadingRef}
        open={Boolean(action)}
        title={deleting ? "Delete this booking?" : "Discard unsaved changes?"}
        description={
          deleting
            ? "This will free up the time slot for your team. This action cannot be undone."
            : "You have booking details that haven’t been saved. Continuing will discard these changes."
        }
        variant={deleting ? "danger" : "warning"}
        confirmLabel={deleting ? "Delete booking" : "Discard & continue"}
        cancelLabel={deleting ? "Keep booking" : "Keep editing"}
        loadingLabel={deleting ? "Deleting…" : "Continuing…"}
        loading={isMutating}
        onClose={editor.closeConfirmation}
        onConfirm={editor.confirmAction}
      >
        {action && (
          <div className="booking-page__confirmation-summary">
            <Icon name={action.type === "date" ? "calendar" : "clock"} />
            <div>
              <strong>
                {action.type === "date"
                  ? "Change booking date"
                  : action.booking.title || "Untitled booking"}
              </strong>
              <p>
                {action.type === "date"
                  ? formatDisplayDate(action.date, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : `${formatDisplayDate(action.booking.date)} · ${action.booking.start}–${action.booking.end}`}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

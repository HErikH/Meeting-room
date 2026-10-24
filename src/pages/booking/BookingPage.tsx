import { useEffect } from "react";
import { useBookingEditor } from "@hooks/useBookingEditor";
import { refreshBookings, useSelectedDate } from "@/store";
import { BookingForm } from "@components/bookingForm/BookingForm";
import { BookingList } from "@components/bookingList/BookingList";
import { DateToolbar } from "@components/dateToolbar/DateToolbar";
import "./style.scss";

export function BookingPage() {
  const selectedDate = useSelectedDate();
  const editor = useBookingEditor(selectedDate);

  useEffect(() => {
    void refreshBookings();
  }, []);

  return (
    <main className="booking-page">
      <header className="booking-page__header">
        <h1 className="booking-page__title">Meeting room bookings</h1>
        <p className="booking-page__subtitle">Working hours 09:00–18:00 · All times are local</p>
      </header>
      <DateToolbar date={selectedDate} onChange={editor.selectDate} />
      <p className="booking-page__notice" role="status">{editor.notice}</p>
      <div className="booking-page__layout">
        <BookingList editingId={editor.editingBooking?.id} onEdit={editor.editBooking}
          onDelete={(booking) => void editor.removeBooking(booking)} />
        <BookingForm key={`${selectedDate}-${editor.editingBooking?.id ?? "new"}`}
          date={selectedDate} booking={editor.editingBooking} onDirty={editor.markDirty}
          onCancel={editor.cancelEditing} onSaved={editor.finishSaving} />
      </div>
    </main>
  );
}

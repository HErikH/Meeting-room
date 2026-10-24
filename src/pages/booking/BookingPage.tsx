import { useEffect } from "react";
import { useBookingEditor } from "@hooks/useBookingEditor";
import { refreshBookings, useSelectedDate } from "@/store";
import { BookingForm } from "@components/bookingForm/BookingForm";
import { BookingList } from "@components/bookingList/BookingList";
import { DateToolbar } from "@components/dateToolbar/DateToolbar";
import { Header } from "@components/header/Header";
import "./style.scss";

export function BookingPage() {
  const selectedDate = useSelectedDate();
  const editor = useBookingEditor(selectedDate);

  useEffect(() => {
    void refreshBookings();
  }, []);

  return (
    <main className="booking-page">
      <Header />

      <DateToolbar date={selectedDate} onChange={editor.selectDate} />

      <p className="booking-page__notice" role="status">
        {editor.notice}
      </p>
      <div className="booking-page__layout">
        <BookingList
          editingId={editor.editingBooking?.id}
          onEdit={editor.editBooking}
          onDelete={(booking) => void editor.removeBooking(booking)}
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
    </main>
  );
}

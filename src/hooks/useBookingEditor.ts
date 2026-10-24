import { useState } from "react";
import type { T_Booking } from "@app-types/booking";
import { changeDate, deleteBooking, useIsMutating } from "@/store";

export function useBookingEditor(selectedDate: string) {
  const [editingBooking, setEditingBooking] = useState<T_Booking | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const isMutating = useIsMutating();

  function selectDate(date: string) {
    if (!date || date === selectedDate || isMutating) return;
    if (isDirty && !window.confirm("Discard your unsaved booking details and change the date?")) return;

    setEditingBooking(null);
    setIsDirty(false);
    setNotice("");
    void changeDate(date);
  }

  function editBooking(booking: T_Booking) {
    if (editingBooking?.id === booking.id) return;
    if (isDirty && !window.confirm("Discard your unsaved details and edit this booking?")) return;

    setEditingBooking(booking);
    setIsDirty(false);
    setNotice("");
  }

  async function removeBooking(booking: T_Booking) {
    if (!window.confirm(`Delete ${booking.title || "this booking"} (${booking.start}–${booking.end})?`)) return;
    setNotice("");

    if (await deleteBooking(booking.id)) {
      if (editingBooking?.id === booking.id) {
        setEditingBooking(null);
        setIsDirty(false);
      }
      setNotice("Booking deleted.");
    }
  }

  function markDirty() {
    setIsDirty(true);
    setNotice("");
  }

  function cancelEditing() {
    setEditingBooking(null);
    setIsDirty(false);
    setNotice("");
  }

  function finishSaving() {
    setNotice(editingBooking ? "Booking updated." : "Booking created.");
    setEditingBooking(null);
    setIsDirty(false);
  }

  return {
    editingBooking,
    notice,
    selectDate,
    editBooking,
    removeBooking,
    markDirty,
    cancelEditing,
    finishSaving,
  };
}

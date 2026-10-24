import { useState } from "react";
import type { T_Booking } from "@app-types/booking";
import { changeDate, deleteBooking, useIsMutating } from "@/store";
import { useBookingsStore } from "@/store/bookings/store";
import { isValidDate } from "@utils/dateTime";

type T_PendingAction =
  | { type: "date"; date: string }
  | { type: "edit"; booking: T_Booking }
  | { type: "delete"; booking: T_Booking };

export function useBookingEditor(selectedDate: string) {
  const [editingBooking, setEditingBooking] = useState<T_Booking | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState<T_PendingAction | null>(
    null,
  );
  const isMutating = useIsMutating();

  function openDate(date: string) {
    setEditingBooking(null);
    setIsDirty(false);
    setNotice("");
    void changeDate(date);
  }

  function selectDate(date: string) {
    if (!isValidDate(date) || date === selectedDate || isMutating) return;
    if (isDirty) {
      setPendingAction({ type: "date", date });
      return;
    }
    openDate(date);
  }

  function openEditor(booking: T_Booking) {
    setEditingBooking(booking);
    setIsDirty(false);
    setNotice("");
  }

  function editBooking(booking: T_Booking) {
    if (editingBooking?.id === booking.id || isMutating) return;

    if (isDirty) {
      setPendingAction({ type: "edit", booking });
      return;
    }
    openEditor(booking);
  }

  function removeBooking(booking: T_Booking) {
    if (!isMutating) setPendingAction({ type: "delete", booking });
  }

  async function confirmAction() {
    if (!pendingAction || isMutating) return;

    if (pendingAction.type === "date") {
      openDate(pendingAction.date);
    } else if (pendingAction.type === "edit") {
      openEditor(pendingAction.booking);
    } else {
      setNotice("");
      if (!(await deleteBooking(pendingAction.booking.id))) {
        throw new Error(
          useBookingsStore.getState().deleteError ??
            "Unable to delete this booking. Please try again.",
        );
      }
      if (editingBooking?.id === pendingAction.booking.id) {
        setEditingBooking(null);
        setIsDirty(false);
      }
      setNotice("Booking deleted.");
    }
    setPendingAction(null);
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
    pendingAction,
    confirmAction,
    closeConfirmation: () => {
      if (!isMutating) setPendingAction(null);
    },
    dismissNotice: () => setNotice(""),
    selectDate,
    editBooking,
    removeBooking,
    markDirty,
    cancelEditing,
    finishSaving,
  };
}

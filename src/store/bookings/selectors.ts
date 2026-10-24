import { useBookingsStore } from './store';

export const useSelectedDate = () => useBookingsStore((store) => store.selectedDate);
export const useBookings = () => useBookingsStore((store) => store.bookings);
export const useBookingsStatus = () => useBookingsStore((store) => store.status);
export const useBookingsError = () => useBookingsStore((store) => store.error);
export const useIsSaving = () => useBookingsStore((store) => store.isSaving);
export const useDeletingId = () => useBookingsStore((store) => store.deletingId);
export const useDeleteError = () => useBookingsStore((store) => store.deleteError);
export const useIsMutating = () => useBookingsStore((store) => store.isSaving || store.deletingId !== null);

// Event handlers can read the latest data without creating a React subscription.
export const getBookings = () => useBookingsStore.getState().bookings;

import { Notice } from "@UI/notice/Notice";
import { Spinner } from "@UI/spinner/Spinner";

export function AvailabilityStatus({ status }: { status: string }) {
  return (
    <div className="booking-form__status">
      {status === "error" ? (
        <Notice variant="warning">Reload bookings before saving.</Notice>
      ) : (
        <Spinner label="Loading availability…" />
      )}
    </div>
  );
}

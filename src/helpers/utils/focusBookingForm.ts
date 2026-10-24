export function focusBookingForm() {
  const input = document.getElementById(
    "booking-start",
  ) as HTMLInputElement | null;

  const target =
    input && !input.matches(":disabled")
      ? input
      : document.getElementById("selected-date");

  target?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "center",
  });

  target?.focus({ preventScroll: true });
}

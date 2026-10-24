import { useEffect, type RefObject } from "react";

const SELECTOR = '[aria-invalid="true"]:not(:disabled), [role="alert"]';

/** Focuses the first invalid field or error notice after a failed submission. */
export function useFocusFirstInvalid(
  container: RefObject<HTMLElement | null>,
  attempt: number,
) {
  useEffect(() => {
    if (attempt === 0) return;
    container.current?.querySelector<HTMLElement>(SELECTOR)?.focus();
  }, [attempt, container]);
}

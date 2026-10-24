import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import { Notice } from "@UI/notice/Notice";
import "./style.scss";

type T_Props = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
  onClose: () => void;
  /** The caller closes the modal after a successful action. Rejections stay visible for retry. */
  onConfirm?: () => void | Promise<unknown>;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
};

export function Modal({ open, ...props }: T_Props) {
  return open ? createPortal(<ModalDialog {...props} />, document.body) : null;
}

function ModalDialog({
  title,
  description,
  children,
  variant = "default",
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loadingLabel = "Processing…",
  loading = false,
  confirmDisabled = false,
  closeOnEscape = true,
  closeOnBackdrop = true,
  returnFocusRef,
  fallbackFocusRef,
}: Omit<T_Props, "open">) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const backdropPointer = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const busy = loading || pending;

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const returnTarget = returnFocusRef?.current;
    const fallbackTarget = fallbackFocusRef?.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    cancelRef.current?.focus();

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      const target = returnTarget?.isConnected
        ? returnTarget
        : trigger?.isConnected
          ? trigger
          : fallbackTarget;
      target?.focus();
    };
  }, [returnFocusRef, fallbackFocusRef]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function handleConfirm() {
    if (!onConfirm || submitting.current || busy || confirmDisabled) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${variant}`}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (closeOnEscape && !busy) onClose();
      }}
      onPointerDown={(event) => {
        backdropPointer.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          backdropPointer.current &&
          event.target === event.currentTarget &&
          closeOnBackdrop &&
          !busy
        )
          onClose();
      }}
    >
      <div className="modal__body">
        <div className="modal__top">
          <span className="modal__icon">
            <Icon
              name={
                variant === "danger"
                  ? "trash"
                  : variant === "warning"
                    ? "warning"
                    : variant === "success"
                      ? "check"
                      : "info"
              }
            />
          </span>
          <Button
            variant="ghost"
            iconOnly
            icon={<Icon name="close" />}
            aria-label="Close dialog"
            disabled={busy}
            onClick={onClose}
          />
        </div>
        <h2 className="modal__title" id={`${id}-title`}>
          {title}
        </h2>
        {description && (
          <p className="modal__description" id={`${id}-description`}>
            {description}
          </p>
        )}
        {children && <div className="modal__content">{children}</div>}
        {error && (
          <Notice
            ref={errorRef}
            variant="error"
            className="modal__error"
            tabIndex={-1}
          >
            {error}
          </Notice>
        )}
      </div>
      <div className="modal__actions">
        <Button ref={cancelRef} disabled={busy} onClick={onClose}>
          {onConfirm ? cancelLabel : "Close"}
        </Button>
        {onConfirm && (
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            loading={busy}
            loadingLabel={loadingLabel}
            disabled={confirmDisabled}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </dialog>
  );
}

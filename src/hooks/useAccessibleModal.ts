import { useEffect, useRef, useId } from 'react';

export interface UseAccessibleModalOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export interface ModalStackEntry {
  id: string;
  onClose: () => void;
  closeOnEscape: boolean;
  trapFocus: boolean;
  modalRef: React.RefObject<HTMLElement | null>;
}

const modalStack: ModalStackEntry[] = [];
let bodyScrollLockCount = 0;
let originalBodyOverflow: string | null = null;

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (bodyScrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyScrollLockCount++;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow ?? '';
    originalBodyOverflow = null;
  }
}

const isVisibleElement = (el: HTMLElement): boolean => {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
  }
  return true;
};

let isGlobalListenerAttached = false;

function ensureGlobalListener() {
  if (isGlobalListenerAttached || typeof window === 'undefined') return;

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (modalStack.length === 0) return;

    const topModal = modalStack[modalStack.length - 1];

    if (e.key === 'Escape' && topModal.closeOnEscape) {
      e.preventDefault();
      e.stopPropagation();
      topModal.onClose();
      return;
    }

    if (e.key === 'Tab' && topModal.trapFocus && topModal.modalRef.current) {
      const container = topModal.modalRef.current;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(isVisibleElement);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  isGlobalListenerAttached = true;
}

export function useAccessibleModal<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  closeOnEscape = true,
  trapFocus = true,
  lockScroll = true,
  initialFocusRef,
}: UseAccessibleModalOptions) {
  const modalRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const hookId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    ensureGlobalListener();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const entry: ModalStackEntry = {
      id: hookId,
      onClose: () => onCloseRef.current(),
      closeOnEscape,
      trapFocus,
      modalRef,
    };
    modalStack.push(entry);

    if (lockScroll) {
      lockBodyScroll();
    }

    const focusTimer = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(isVisibleElement);

        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    });

    return () => {
      cancelAnimationFrame(focusTimer);

      const idx = modalStack.findIndex((m) => m.id === hookId);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
      }

      if (lockScroll) {
        unlockBodyScroll();
      }

      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, lockScroll, initialFocusRef, hookId, closeOnEscape, trapFocus]);

  return modalRef;
}

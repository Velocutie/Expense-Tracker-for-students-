'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the user clicks the backdrop or presses Escape */
  onClose: () => void;
  /** Shown in the modal header */
  title: string;
  /** Unique id that labels the dialog (for aria-labelledby) */
  titleId?: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Extra classes on the panel box (e.g. max-w-lg) */
  panelClassName?: string;
}

/**
 * Shared modal/dialog component.
 *
 * Renders via ReactDOM.createPortal directly into document.body so that:
 *  - ancestor `overflow: auto` on <main> cannot trap the fixed overlay
 *  - ancestor `backdrop-filter` on the sidebar glass card cannot affect the overlay
 *  - the z-50 overlay always covers the entire viewport, including the sidebar
 *
 * The scrim is a plain semi-transparent dark colour — NO backdrop-filter/blur —
 * so the page behind remains visually solid and filled.
 */
export function Modal({
  open,
  onClose,
  title,
  titleId,
  children,
  panelClassName = '',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const labelId = titleId ?? 'modal-title';

  /* ── Escape key ───────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  /* ── Focus trap: move focus into dialog when it opens ─────── */
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;
    // Small rAF delay so the element is painted before focussing
    const id = requestAnimationFrame(() => {
      const first = el.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  /* createPortal only works in a browser environment */
  if (typeof document === 'undefined') return null;

  return createPortal(
    /*
     * Scrim layer: covers the full viewport including sidebar.
     * bg-black/50 dark:bg-black/65 dims the page without blur.
     * NO backdrop-filter here — that's what caused the "black page" bug.
     */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 dark:bg-black/65"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
       * Panel: solid white/dark-800 surface, never transparent.
       * max-h-[90vh] + overflow-y-auto gives internal scroll for tall content.
       * animate-modal-in is defined in globals.css.
       */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={`
          relative w-full max-w-md
          bg-white dark:bg-gray-800
          border border-gray-200/80 dark:border-gray-700
          rounded-2xl shadow-2xl
          max-h-[90vh] overflow-y-auto
          animate-modal-in
          ${panelClassName}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              id={labelId}
              className="text-lg font-bold text-gray-900 dark:text-white leading-snug"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 -mr-1 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-90"
              aria-label="Close dialog"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

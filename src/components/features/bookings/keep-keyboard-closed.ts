/**
 * A dialog's onOpenAutoFocus: focus the dialog itself rather than its first field, so a phone's
 * keyboard doesn't open over the dialog before staff have read it. Escape and the focus trap still work.
 */
export function keepKeyboardClosed(e: Event) {
  e.preventDefault();
  (e.currentTarget as HTMLElement).focus();
}

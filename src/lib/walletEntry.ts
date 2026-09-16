/**
 * Move from Everspan's native dialog to a third-party wallet modal.
 *
 * A modal `<dialog>` lives in the browser's top layer. Wallets Kit mounts a
 * regular fixed element under `<body>`, so opening it while the dialog is
 * still active makes the picker present but impossible to see or use. Waiting
 * one animation frame after requesting the close gives React's layout effect
 * time to remove the dialog from the top layer first.
 */

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()))
}

export async function openAfterDialogCloses<T>(
  closeDialog: () => void,
  openWallet: () => Promise<T>,
  waitForClose: () => Promise<void> = nextFrame,
): Promise<T> {
  closeDialog()
  await waitForClose()
  return openWallet()
}

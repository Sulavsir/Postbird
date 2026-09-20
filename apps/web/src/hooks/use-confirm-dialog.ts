import { useCallback, useRef, useState } from "react";

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
  });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setState({ ...next, open: true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setState((current) => ({ ...current, open: false }));
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  return {
    confirm,
    modal: {
      open: state.open,
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      onCancel: () => settle(false),
      onConfirm: () => settle(true),
    },
  };
}

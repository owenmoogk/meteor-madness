// use-toast.ts
// This file implements a global toast notification system for React apps.
// It provides a hook (`useToast`) and an imperative API (`toast`) to show, update, and dismiss toast messages.
// Toasts are managed in a global in-memory state, and the system supports only one toast at a time (TOAST_LIMIT = 1).

import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Maximum number of toasts to display at once
const TOAST_LIMIT = 1;
// Delay (in ms) before a toast is automatically removed after being dismissed
const TOAST_REMOVE_DELAY = 1000000;

// Type for a toast object, extending ToastProps with id and optional fields
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Action type constants for the reducer
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Simple counter for generating unique toast IDs
let count = 0;

// Generates a unique string ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Type for the actionTypes object
type ActionType = typeof actionTypes;

// Union type for all possible actions in the reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

// State shape: an array of toasts
interface State {
  toasts: ToasterToast[];
}

// Map to keep track of timeouts for removing toasts after dismissal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Adds a toast to the removal queue, so it will be removed after TOAST_REMOVE_DELAY ms
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Reducer function to manage toast state based on actions
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast to the front, limit to TOAST_LIMIT
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      // Update an existing toast by id
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Schedule removal of the toast after delay
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        // If no id, dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Set open: false for the dismissed toast(s)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      // Remove a toast by id, or all if no id
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Listeners for state changes (used to update React state in all hook consumers)
const listeners: Array<(state: State) => void> = [];

// Global in-memory state for toasts
let memoryState: State = { toasts: [] };

// Dispatches an action to the reducer and notifies all listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Type for the toast() API input (does not include id)
type Toast = Omit<ToasterToast, "id">;

// Imperative API to show a toast
function toast({ ...props }: Toast) {
  const id = genId();

  // Function to update this toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  // Function to dismiss this toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Add the toast to state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      // When the toast closes, dismiss it
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Return API for this toast
  return {
    id: id,
    dismiss,
    update,
  };
}

// React hook to access toast state and API in components
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  // Subscribe to global state changes
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Return current state and API
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Export the hook and the imperative API
export { useToast, toast };

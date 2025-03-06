
// Import from the UI component directly to avoid circular imports
import { toast as originalToast, useToast as originalUseToast } from "@/components/ui/toast";

// Re-export the toast function and useToast hook
export const toast = originalToast;
export const useToast = originalUseToast;

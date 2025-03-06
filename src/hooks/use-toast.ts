
import { toast as originalToast, useToast as originalUseToast } from "@/components/ui/use-toast";

// Re-export the toast function and useToast hook
export const toast = originalToast;
export const useToast = originalUseToast;

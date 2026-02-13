import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export const usePreventNavigation = (
  shouldPrevent: boolean,
  onNavigate?: (href?: string) => void
) => {
  const router = useRouter();
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!shouldPrevent) return;

    const originalPush = router.push;
    const originalReplace = router.replace;

    (router as any).push = function (href: string, options?: any) {
      // If we're already submitting, use the original push method to avoid recursion
      if (isSubmitting.current) {
        return originalPush.call(this, href, options);
      }
      
      if (onNavigate) {
        isSubmitting.current = true;
        onNavigate(href);
      } else {
        return originalPush.call(this, href, options);
      }
    };

    (router as any).replace = function (href: string, options?: any) {
      // If we're already submitting, use the original replace method to avoid recursion
      if (isSubmitting.current) {
        return originalReplace.call(this, href, options);
      }
      
      if (onNavigate) {
        isSubmitting.current = true;
        onNavigate(href);
      } else {
        return originalReplace.call(this, href, options);
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [shouldPrevent, onNavigate]);
  
  // Expose a function to reset the submitting state if needed
  return {
    setIsSubmitting: (value: boolean) => {
      isSubmitting.current = value;
    }
  };
};

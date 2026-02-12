import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const usePreventNavigation = (
  shouldPrevent: boolean,
  onNavigate?: (href?: string) => void
) => {
  const router = useRouter();

  useEffect(() => {
    if (!shouldPrevent) return;

    const originalPush = router.push;
    const originalReplace = router.replace;

    (router as any).push = function (href: string, options?: any) {
      // Auto-submit the exam without showing a confirmation
      if (onNavigate) {
        onNavigate(href);
      } else {
        return originalPush.call(this, href, options);
      }
    };

    (router as any).replace = function (href: string, options?: any) {
      // Auto-submit the exam without showing a confirmation
      if (onNavigate) {
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
};

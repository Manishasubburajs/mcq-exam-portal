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

    router.push = function (href, options) {
      const confirmed = window.confirm("Do you want to leave the exam? Your current progress will be saved and the exam will be submitted automatically.");
      if (confirmed) {
        if (onNavigate) {
          // Call onNavigate without returning to allow it to handle navigation
          onNavigate(href as string);
        } else {
          return originalPush.call(this, href, options);
        }
      }
    };

    router.replace = function (href, options) {
      const confirmed = window.confirm("Do you want to leave the exam? Your current progress will be saved and the exam will be submitted automatically.");
      if (confirmed) {
        if (onNavigate) {
          // Call onNavigate without returning to allow it to handle navigation
          onNavigate(href as string);
        } else {
          return originalReplace.call(this, href, options);
        }
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [shouldPrevent, onNavigate]);
};

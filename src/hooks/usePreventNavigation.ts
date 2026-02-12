import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const usePreventNavigation = (
  shouldPrevent: boolean,
  onNavigate?: () => void
) => {
  const router = useRouter();

  useEffect(() => {
    if (!shouldPrevent) return;

    const handleNavigation = () => {
      const confirmed = window.confirm("Do you want to leave the exam? Your current progress will be saved and the exam will be submitted automatically.");
      if (confirmed) {
        if (onNavigate) {
          onNavigate();
        }
      } else {
        return false;
      }
    };

    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = function (href, options) {
      if (handleNavigation()) {
        return originalPush.call(this, href, options);
      }
    };

    router.replace = function (href, options) {
      if (handleNavigation()) {
        return originalReplace.call(this, href, options);
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [shouldPrevent, onNavigate]);
};

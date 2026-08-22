type ViewTransitionLike = {
  finished: Promise<unknown>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

/**
 * Uses the browser's shared-element-style document transition where available.
 * Older browsers fall back to the normal router navigation with no blocking delay.
 */
export function navigateWithTransition(navigate: () => void) {
  if (typeof document === 'undefined') {
    navigate();
    return;
  }

  const transitionDocument = document as ViewTransitionDocument;
  if (!transitionDocument.startViewTransition) {
    navigate();
    return;
  }

  document.documentElement.dataset.routeTransition = 'active';
  const viewTransition = transitionDocument.startViewTransition(navigate);
  void viewTransition.finished.finally(() => {
    delete document.documentElement.dataset.routeTransition;
  });
}

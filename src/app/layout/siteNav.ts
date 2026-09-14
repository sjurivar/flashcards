const MOBILE_NAV_QUERY = '(max-width: 720px)';

type RootWithCleanup = HTMLElement & { _navCleanup?: () => void };

export function bindSiteNav(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = root.querySelector<HTMLElement>('#hovedmeny');
  if (!toggle || !nav) {
    return;
  }

  const host = root as RootWithCleanup;
  host._navCleanup?.();

  const controller = new AbortController();
  const { signal } = controller;
  host._navCleanup = () => controller.abort();

  const media = window.matchMedia?.(MOBILE_NAV_QUERY);
  const isMobile = (): boolean => media?.matches ?? true;

  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    nav.hidden = isMobile() ? !open : false;
  };

  const syncMode = (): void => {
    if (isMobile()) {
      toggle.hidden = false;
      setOpen(toggle.getAttribute('aria-expanded') === 'true');
      return;
    }
    toggle.hidden = true;
    nav.hidden = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Åpne meny');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  }, { signal });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isMobile() || toggle.getAttribute('aria-expanded') !== 'true') {
      return;
    }
    setOpen(false);
    toggle.focus();
  }, { signal });

  document.addEventListener('click', (event) => {
    if (!isMobile() || toggle.getAttribute('aria-expanded') !== 'true') {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node) || nav.contains(target) || toggle.contains(target)) {
      return;
    }
    setOpen(false);
  }, { signal });

  media?.addEventListener?.('change', syncMode, { signal });
  syncMode();
}

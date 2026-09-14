export type Route =
  | { name: 'home' }
  | { name: 'cards' }
  | { name: 'card-new' }
  | { name: 'card-edit'; id: string }
  | { name: 'practice' }
  | { name: 'summary'; id: string }
  | { name: 'data' }
  | { name: 'not-found' };

export function parseHash(hash = window.location.hash): Route {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { name: 'home' };
  }
  if (parts[0] === 'cards' && parts.length === 1) {
    return { name: 'cards' };
  }
  if (parts[0] === 'cards' && parts[1] === 'new') {
    return { name: 'card-new' };
  }
  if (parts[0] === 'cards' && parts[2] === 'edit' && parts[1]) {
    return { name: 'card-edit', id: parts[1] };
  }
  if (parts[0] === 'practice' && parts.length === 1) {
    return { name: 'practice' };
  }
  if (parts[0] === 'practice' && parts[1] === 'summary' && parts[2]) {
    return { name: 'summary', id: parts[2] };
  }
  if (parts[0] === 'data') {
    return { name: 'data' };
  }
  return { name: 'not-found' };
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'cards':
      return '#/cards';
    case 'card-new':
      return '#/cards/new';
    case 'card-edit':
      return `#/cards/${route.id}/edit`;
    case 'practice':
      return '#/practice';
    case 'summary':
      return `#/practice/summary/${route.id}`;
    case 'data':
      return '#/data';
    default:
      return '#/';
  }
}

export function href(route: Route): string {
  return toHash(route);
}

let onRouteChange: ((route: Route) => void) | null = null;

export function navigate(route: Route): void {
  const next = toHash(route);
  const current = window.location.hash.startsWith('#') ? window.location.hash : `#${window.location.hash}`;
  if (current === next) {
    onRouteChange?.(route);
    return;
  }
  window.location.hash = next.replace(/^#/, '');
}

export function startRouter(onChange: (route: Route) => void): void {
  onRouteChange = onChange;
  const notify = () => onChange(parseHash());
  window.addEventListener('hashchange', notify);
  if (!window.location.hash) {
    window.location.hash = '/';
    return;
  }
  notify();
}

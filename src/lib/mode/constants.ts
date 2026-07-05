// src/lib/mode/constants.ts
// The single shared constants surface for the mode system. The runes store, the
// inline no-flash head script, and the toggle all import from here so the storage
// key and DOM attribute are defined in exactly one place.

/**
 * localStorage key holding the visitor's explicit mode choice. NAMESPACED
 * (`did2:` prefix) because GitHub Pages serves all `*.github.io` repos from a
 * shared origin — an unprefixed `mode` key would collide across sibling sites
 * (Pitfall 3).
 */
export const STORAGE_KEY = 'did2:mode';

/** DOM attribute set on <html> that CSS + the store read to reflect the active mode. */
export const DATA_ATTR = 'data-mode';

/** The two first-class modes. `as const` so `Mode` is the literal union, not string. */
export const MODES = ['premium', 'accessible'] as const;

export type Mode = (typeof MODES)[number];

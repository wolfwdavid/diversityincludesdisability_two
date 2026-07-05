<!-- SkipLinks.svelte — rendered FIRST in +layout.svelte, before the header, so these
     two links are the first focusable elements on every page (A11Y-01). Each is
     visually hidden (off-screen) until it receives keyboard focus, then slides into
     view. Their targets (#main / #nav) carry tabindex="-1" in the layout so focus —
     not just scroll — actually moves to them. -->
<a class="skip-link" href="#main">Skip to main content</a>
<a class="skip-link" href="#nav">Skip to navigation</a>

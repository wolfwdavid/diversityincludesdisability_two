<script lang="ts">
	// SECT-06 Accessibility Statement route (replaces the 04-01 placeholder stub).
	// Follows the GOV.UK / scope.org.uk model: a single route-level heading, then the
	// seven conventional sections each under its own section-level heading. The feedback
	// contact reuses the barrel email (CONT-01) so it can never drift from the Contact
	// page. SEO metadata is baked into static HTML via the document head (no head library).
	// This page is linked from the primary nav (site barrel), so the statement is always
	// one click away — a scope.org.uk convention.
	import { contact, seo } from '$lib/content';

	const meta = seo.accessibility;
	const feedback = `mailto:${contact.email}`;
	const reviewed = '2026-07-05';
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<h1>Accessibility Statement</h1>

<section aria-labelledby="a11y-commitment">
	<h2 id="a11y-commitment">Our commitment</h2>
	<p>
		Diversity Includes Disability is committed to making this website accessible to everyone,
		regardless of ability or the technology they use. Accessibility is not an add-on for a
		disability-equity organisation — it is the point. This statement applies to the entire
		diversityincludesdisability.org website, in both its Accessible and Premium experiences.
	</p>
</section>

<section aria-labelledby="a11y-conformance">
	<h2 id="a11y-conformance">Conformance status</h2>
	<p>
		This website conforms to the Web Content Accessibility Guidelines (WCAG) 2.2 level AA. Our
		Accessible experience additionally targets level AAA wherever feasible. Where any content
		falls short, we treat it as a defect to be fixed, not a permanent exception.
	</p>
</section>

<section aria-labelledby="a11y-measures">
	<h2 id="a11y-measures">Measures we take</h2>
	<ul>
		<li>Semantic HTML with a single, logical heading hierarchy on every page.</li>
		<li>Full keyboard operability with a visible focus indicator on every interactive element.</li>
		<li>
			An Accessible mode that ships <strong>zero WebGL</strong> and is a genuine peer to the
			Premium experience — not a degraded fallback. Every piece of information and every call to
			action is present in both modes.
		</li>
		<li>A DID colour palette whose text and interface pairs are contrast-checked to WCAG 2.2 AA.</li>
		<li>Respect for the operating-system reduced-motion preference, which defaults to Accessible mode.</li>
	</ul>
</section>

<section aria-labelledby="a11y-limitations">
	<h2 id="a11y-limitations">Known limitations</h2>
	<ul>
		<li>
			The Premium 3D experience is a client-only visual enhancement. If your browser or device
			cannot run WebGL, the Accessible experience is served automatically with no loss of content.
		</li>
		<li>
			Some social-media handles are still pending confirmation and are therefore listed as plain
			text rather than links until the correct accounts are verified.
		</li>
	</ul>
</section>

<section aria-labelledby="a11y-feedback">
	<h2 id="a11y-feedback">Feedback</h2>
	<p>
		If you encounter any accessibility barrier on this site, or need information in a different
		format, please tell us — your feedback helps us improve.
		<a href={feedback}>Email us at {contact.email}</a>. We aim to respond promptly.
	</p>
</section>

<section aria-labelledby="a11y-assessment">
	<h2 id="a11y-assessment">How we assessed this site</h2>
	<p>
		This site was assessed by a combination of self-evaluation, automated axe-core scans against
		the WCAG 2.2 AA rule set on every page in both modes, and manual keyboard and screen-reader
		testing. These checks run as an ongoing part of our build process.
	</p>
</section>

<section aria-labelledby="a11y-review">
	<h2 id="a11y-review">Preparation and review</h2>
	<p>This statement was prepared and last reviewed on {reviewed}.</p>
</section>

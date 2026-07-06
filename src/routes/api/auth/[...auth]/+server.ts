import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

/**
 * Removes the `Domain` attribute from a Set-Cookie string so the cookie becomes host-only
 * for whatever domain this proxy is served from. The upstream auth server scopes cookies to
 * `Domain=erza.ai`, which the browser rejects when the app runs on a different host
 * (e.g. localhost). Cookie name and all other attributes (Secure, SameSite, HttpOnly) are
 * left untouched so the auth server still recognises the cookie on subsequent requests.
 */
function stripCookieDomain(cookie: string): string {
	return cookie.replace(/;\s*Domain=[^;]*/i, '');
}

export const fallback: RequestHandler = async ({ request, url }) => {
	// The remote better-auth server mounts at its default basePath (/api/auth), which
	// matches this proxy's own mount, so we forward the full incoming path unchanged.
	const authServerUrl = env.PUBLIC_AUTH_SERVER_URL ?? 'https://auth.dev.erza.ai';
	const targetUrl = new URL(`${url.pathname}${url.search}`, authServerUrl);

	const headers = new Headers();
	// Forward crucial headers. 'origin' is required: better-auth validates it for CSRF
	// protection on state-changing requests (sign-in/sign-up) against its trustedOrigins.
	const headersToForward = ['cookie', 'content-type', 'authorization', 'accept', 'origin'];
	for (const headerName of headersToForward) {
		const value = request.headers.get(headerName);
		if (value) {
			headers.set(headerName, value);
		}
	}

	// We must not forward the original host header to the upstream server,
	// so let fetch set the correct host header for the target URL.

	const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
	const body = hasBody ? await request.arrayBuffer() : undefined;

	try {
		const response = await fetch(targetUrl.toString(), {
			method: request.method,
			headers,
			body,
			redirect: 'manual'
		});

		// Copy response headers. Set-Cookie needs special handling for two reasons:
		//  1. The Fetch API folds multiple Set-Cookie headers into a single comma-joined
		//     value via forEach/get, which corrupts them. getSetCookie() returns each
		//     Set-Cookie as its own string so they survive intact.
		//  2. The auth server scopes its cookies to Domain=erza.ai. That won't match the
		//     app's own host (e.g. localhost), so the browser drops them. We strip the
		//     Domain attribute to make each cookie host-only for the app domain; the
		//     browser then resends it and we forward it back upstream on get-session.
		const responseHeaders = new Headers();
		response.headers.forEach((value, key) => {
			if (key.toLowerCase() === 'set-cookie') return; // handled below
			responseHeaders.append(key, value);
		});
		for (const cookie of response.headers.getSetCookie()) {
			responseHeaders.append('set-cookie', stripCookieDomain(cookie));
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders
		});
	} catch (err) {
		console.error('Auth proxy request failed:', err);
		return error(500, 'Proxy error connecting to authentication server');
	}
};

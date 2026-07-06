import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const fallback: RequestHandler = async ({ request, params, url }) => {
	const authPath = params.auth;
	// The auth server at auth.dev.erza.ai has better-auth mounted at the root level (/),
	// so we strip the local '/api/auth' prefix when forwarding the request.
	const targetUrl = new URL(`/${authPath}${url.search}`, 'https://auth.dev.erza.ai');

	const headers = new Headers();
	// Forward crucial headers
	const headersToForward = ['cookie', 'content-type', 'authorization', 'accept'];
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

		// Copy headers from response
		const responseHeaders = new Headers();
		response.headers.forEach((value, key) => {
			// Forward set-cookie headers so that cookies set by the auth server
			// are set on the SvelteKit app domain
			responseHeaders.append(key, value);
		});

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

import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public';

function getBaseUrl(): string {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/api/auth`;
	}
	return `${env.PUBLIC_APP_URL ?? 'http://localhost:5173'}/api/auth`;
}

export const authClient = createAuthClient({
	baseURL: getBaseUrl()
});

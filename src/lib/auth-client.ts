import { createAuthClient } from 'better-auth/svelte';

function getBaseUrl(): string {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/api/auth`;
	}
	return 'http://localhost:5173/api/auth';
}

export const authClient = createAuthClient({
	baseURL: getBaseUrl()
});

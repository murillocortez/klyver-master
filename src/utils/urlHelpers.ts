
/**
 * Helper to generate correct URLs for Admin and Store projects
 * based on environment variables and tenant slug.
 */

export const getAdminUrl = (slug: string): string => {
    const baseUrl = import.meta.env.VITE_ADMIN_BASE_URL || 'http://localhost:5174';

    // Clean trailing slash if exists
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Format: BASE_URL?tenant=slug
    return `${cleanBase}?tenant=${slug}`;
};

export const getStoreUrl = (slug: string): string => {
    const baseUrl = import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:5173';

    // Clean trailing slash if exists
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Format: BASE_URL?tenant=slug
    return `${cleanBase}?tenant=${slug}`;
};

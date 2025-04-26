import { URLs } from './constants.js';

/**
 * Extracts the segment immediately after `/projects/` in any URL.
 * @returns {string|null} The project ID or null if not found.
 */
export function getProjectId(): string | null {
  try {
    const url = window.location.href;
    const { pathname } = new URL(url);
    const parts = pathname.split('/'); // e.g. ["", "projects", "cca3…", "pokzepokfez"]
    const idx = parts.indexOf('projects');
    return idx !== -1 && parts[idx + 1] ? parts[idx + 1] : null;
  } catch (e) {
    console.error('Invalid URL');
    return null;
  }
}

export function getProjectSourceApiUrl(): string | null {
  const projectId = getProjectId();

  // If projectId is null, return the URL with null
  if (projectId === null) return null;

  // Otherwise, return the URL with the projectId
  return URLs.projectSourceAPI(projectId);
}

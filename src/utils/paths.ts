/**
 * Paths utility to handle GitHub Pages deployments.
 * Prepends base path in production and redirects API endpoints to precompiled static JSON files.
 */

const isProd = process.env.NODE_ENV === 'production';
const repositoryName = 'Jesuit-Pune-Province-Dashboard';

export const getAssetPath = (pathStr: string): string => {
  const prefix = isProd ? `/${repositoryName}` : '';
  if (pathStr.startsWith(prefix) && prefix !== '') {
    return pathStr;
  }
  return `${prefix}${pathStr.startsWith('/') ? '' : '/'}${pathStr}`;
};

export const getApiUrl = (apiPath: string): string => {
  if (isProd) {
    if (apiPath.startsWith('/api/get-village-info')) {
      // Return empty string to signal client-side fallback
      return '';
    }
    // Extract pathname and remove query params
    const basePathOnly = apiPath.split('?')[0];
    const staticName = basePathOnly.replace('/api/', '') + '.json';
    return getAssetPath(`/data/${staticName}`);
  }
  return apiPath;
};

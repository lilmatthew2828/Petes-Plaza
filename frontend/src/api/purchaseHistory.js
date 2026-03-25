import { apiCall } from './client'; // Use named import, not default

export const getPurchaseHistory = () => {
  return apiCall('purchase-history/'); // No leading slash, let client handle the prefix
};

export const purchaseItem = (listingId) => {
  return apiCall(`purchase-history/purchase/${listingId}`, {
    method: 'POST'
  });
};
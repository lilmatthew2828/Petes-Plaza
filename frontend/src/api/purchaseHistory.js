// Jania Southall - API functions for purchase history related operations.
import { apiCall } from './client'; 

export const getPurchaseHistory = () => {
  return apiCall('/api/purchase-history/'); //Emmanuella Obidike - Added slash to match backend route
};

export const purchaseItem = (listingId) => {
  return apiCall(`/api/purchase-history/purchase/${listingId}`, { //Emmanuella Obidike - Added slash to match backend route
    method: 'POST'
  });
};

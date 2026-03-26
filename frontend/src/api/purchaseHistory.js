import { apiCall } from './client'; 

export const getPurchaseHistory = () => {
  return apiCall('purchase-history/'); 
};

export const purchaseItem = (listingId) => {
  return apiCall(`purchase-history/purchase/${listingId}`, {
    method: 'POST'
  });
};
import { apiCall } from './client';

export const createOffer = (listingId) => {
  return apiCall(`/offers/${listingId}`, {  // Fixed: removed query param
    method: 'POST'
  });
};

export const getSellerOffers = (sellerEmail) => {
  return apiCall(`/offers/seller/${sellerEmail}`);
};

export const getBuyerOffers = (buyerEmail) => {
  return apiCall(`/offers/buyer/${buyerEmail}`);
};

export const respondToOffer = (offerId, message) => {
  return apiCall(`/offers/${offerId}/respond`, {
    method: 'PATCH',
    body: { message }
  });
};

export const completeOffer = (offerId) => {
  return apiCall(`/offers/${offerId}/complete`, {
    method: 'POST'
  });
};
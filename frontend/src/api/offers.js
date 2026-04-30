// Jania Southall (whole file) - API functions for offers, including creating offers, retrieving offers for sellers and buyers, responding to offers, and completing transactions.
import { apiCall } from './client';

export const createOffer = (listingId) => {
  return apiCall(`/offers/${listingId}`, { 
    method: 'POST'
  });
};

// src/api/offers.js
export async function getSellerOffers() {  // <--- NO variables inside the ()
  return apiCall(`/offers/seller`, {       // <--- NO ${email} or /undefined here
    method: "GET" 
  });
}

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
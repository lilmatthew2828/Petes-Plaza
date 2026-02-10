import { fetchAllListings, fetchMetrics } from "../api/admin.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Populate metrics
  const metrics = await fetchMetrics();
  document.getElementById("total-users").textContent = metrics.totalUsers;
  document.getElementById("total-listings").textContent = metrics.totalListings;

  // Populate listings table
  const listings = await fetchAllListings();
  const tbody = document.getElementById("listings").querySelector("tbody");
  listings.forEach(listing => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${listing.id}</td>
      <td>${listing.title}</td>
      <td>$${listing.price.toFixed(2)}</td>
      <td>${listing.status}</td>
      <td>${listing.seller_id}</td>
      <td>
        <button onclick="updateStatus(${listing.id}, 'sold')">Mark Sold</button>
        <button onclick="deleteListing(${listing.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
});

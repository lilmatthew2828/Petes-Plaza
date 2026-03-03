// Use Vite proxy for API calls; do not hardcode backend URL

export async function getAdminDashboard() { // Fetch admin dashboard metrics and listings
    const res = await fetch('/api/admin/dashboard'); // File referenced is admin.js because the /api/admin/dashboard endpoint returns all the necessary data for the admin dashboard in one call, including metrics and listings. This simplifies the frontend code by reducing the number of API calls needed to populate the dashboard.
    if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    return res.json();
}

export async function moderateListing(listingID, action) { // Action can be 'approve', 'deny','mark_sold', etc.
    const res = await fetch(`/api/admin/listings/${listingID}/moderate`, { // Call the moderate endpoint for a specific listing ID with the desired action in the request body. The file referenced 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
    });
    if (!res.ok) {
        throw new Error('Failed to moderate listing');
    }
    return res.json();
}

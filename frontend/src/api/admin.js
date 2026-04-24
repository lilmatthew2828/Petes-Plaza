// Daye Karibi-Whyte - whole file
export async function getAdminDashboard() { // Fetch admin dashboard metrics and listings
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`,  // Emmanuella Obidike - Use VITE_api_url from .env production file */
        {credentials: "include"}
    ); // File referenced is admin.js because the /api/admin/dashboard endpoint returns all the necessary data for the admin dashboard in one call, including metrics and listings. This simplifies the frontend code by reducing the number of API calls needed to populate the dashboard.
    if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    return res.json();
}

export async function moderateListing(listingID, action) { // Action can be 'approve', 'deny','mark_sold', etc.
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/listings/${listingID}/moderate`, { // Emmanuella Obidike - Use VITE_api_url from .env production file 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
        credentials: "include"
    }
);
    if (!res.ok) {
        throw new Error('Failed to moderate listing');
    }
    return res.json();
}

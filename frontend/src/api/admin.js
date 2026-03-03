// Use Vite proxy for API calls; do not hardcode backend URL

export async function getAdminDashboard() { // Fetch admin dashboard metrics and listings
    const res = await fetch('/api/admin/dashboard');
    if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    return res.json();
}

export async function moderateListing(listingID, action) { // Action can be 'approve', 'deny','mark_sold', etc.
    const res = await fetch(`/api/admin/listings/${listingID}/moderate`, {
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

const BASE_URL = "http://localhost:8000";

export async function getAdminDashboard(){
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`);
    if (!res.ok){
        throw new Error("Failed to fetch dashboard data");
    }
    return res.json();
}

export async function moderateListing(listingID, action) {
    const res = await fetch(`${BASE_URL}/api/admin/listings/${listingID}/moderate`, {
        method: 'POST',
        headers: { 
            "Content-Type": "application/json",
},
        body: JSON.stringify({action}),
    });
    if (!res.ok){
        throw new Error("Failed to moderate listing");
    }
    return res.json();
}

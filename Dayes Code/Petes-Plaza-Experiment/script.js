console.log("script loaded ✅");

// ===== Tabs: change the main title + description =====
const tabs = document.querySelectorAll(".tab");
const pageTitle = document.getElementById("pageTitle");
const pageDesc  = document.getElementById("pageDesc");

const descMap = {
  "Home": "Welcome to Pete's Plaza. Use tabs and categories to explore listings.",
  "Men's": "Men’s section — browse items made for men.",
  "Women's": "Women’s section — browse items made for women.",
  "Accessories": "Accessories section — bags, hats, jewelry, and more.",
  "Contact Us": "Contact/support section — add a form or email info here."
};

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const page = tab.dataset.page;
    pageTitle.textContent = page;
    pageDesc.textContent = descMap[page] || "Page content goes here.";
    
    // Show all cards when switching tabs (simple behavior)
    showAllCards();
  });
});

// ===== Sidebar categories: filter product cards =====
const categories = document.querySelectorAll(".category");
const cards = document.querySelectorAll(".card");

function showAllCards() {
  cards.forEach(card => card.style.display = "block");
}

function filterCards(category) {
  cards.forEach(card => {
    const cardCat = card.dataset.cat;
    card.style.display = (cardCat === category) ? "block" : "none";
  });
}

categories.forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.cat;
    pageTitle.textContent = cat;
    pageDesc.textContent = `Showing listings for: ${cat}`;
    filterCards(cat);
  });
});

// ===== Top bar buttons (demo placeholders) =====
document.getElementById("btnCreateListing").addEventListener("click", () => {
  alert("Create a Listing clicked! (Next step: add a form here.)");
});

document.getElementById("btnContactTop").addEventListener("click", () => {
  document.querySelector('.tab[data-page="Contact Us"]').click();
});

document.getElementById("btnWishlist").addEventListener("click", () => {
  alert("Wishlist clicked!");
});

document.getElementById("btnCart").addEventListener("click", () => {
  alert("Cart clicked!");
});

document.getElementById("btnSettings").addEventListener("click", () => {
  alert("Settings clicked! (Next step: theme/account settings.)");
});

// ===== PROFILE MODAL =====
const profileBtn = document.getElementById("btnProfile");
const modal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");

profileBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// ESC closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
  }
});
// ---------- WISHLIST (Backend API version) ----------
const btnWishlist = document.getElementById("btnWishlist");
const wishlistModal = document.getElementById("wishlistModal");
const closeWishlist = document.getElementById("closeWishlist");
const wishlistList = document.getElementById("wishlistList");
const wishlistHint = document.getElementById("wishlistHint");

// If your backend is on a different origin, set BASE_URL = "http://localhost:8000"
// If you use Vite proxy or serve from same origin, "" is fine.
const BASE_URL = ""; // "" means same origin
const API = `${BASE_URL}/api`;

function getAuthToken() {
  // adjust these keys to match your login code
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
}

async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  // Try to parse JSON body (if any)
  let body = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await res.json().catch(() => null);
  } else {
    body = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const msg =
      (body && body.detail) ||
      (typeof body === "string" && body) ||
      `Request failed (${res.status})`;

    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

function openWishlist() {
  wishlistModal.classList.remove("hidden");
  loadWishlistFromBackend();
}

function closeWishlistModal() {
  wishlistModal.classList.add("hidden");
}

async function loadWishlistFromBackend() {
  wishlistHint.textContent = "Loading...";
  wishlistList.innerHTML = "";

  try {
    // EXPECTED response shape:
    // [{ listingId, title, price, category, imageUrl }, ...]
    const items = await apiFetch("/wishlist", { method: "GET" });

    if (!items || items.length === 0) {
      wishlistHint.textContent = "";
      wishlistList.innerHTML = `
        <div class="wishlist-item">
          <div>
            <h4>No items yet</h4>
            <p>Your wishlist is empty.</p>
          </div>
        </div>`;
      return;
    }

    wishlistHint.textContent = "";
    wishlistList.innerHTML = items
      .map(
        (it) => `
        <div class="wishlist-item">
          <div>
            <h4>${it.title}</h4>
            <p>$${it.price} • ${it.category}</p>
          </div>
          <button class="wishlist-remove" data-id="${it.listingId}">Remove</button>
        </div>
      `
      )
      .join("");

    wishlistList.querySelectorAll(".wishlist-remove").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const listingId = btn.dataset.id;
        await removeWishlistItem(listingId);
      });
    });
  } catch (e) {
    if (e.status === 401) {
      wishlistHint.textContent = "Please log in to view your wishlist.";
    } else {
      wishlistHint.textContent = `Error loading wishlist: ${e.message}`;
    }
  }
}

async function removeWishlistItem(listingId) {
  try {
    await apiFetch(`/wishlist/${encodeURIComponent(listingId)}`, {
      method: "DELETE",
    });
    await loadWishlistFromBackend();
  } catch (e) {
    alert(`Could not remove item: ${e.message}`);
  }
}

// Button wiring
btnWishlist?.addEventListener("click", openWishlist);
closeWishlist?.addEventListener("click", closeWishlistModal);
wishlistModal?.addEventListener("click", (e) => {
  if (e.target === wishlistModal) closeWishlistModal();
});
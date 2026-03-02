// ===== Modal open/close =====
const authModal = document.getElementById("authModal");
const btnProfile = document.getElementById("btnProfile");
const closeModal = document.getElementById("closeModal");

btnProfile.addEventListener("click", () => {
  authModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  authModal.classList.add("hidden");
});

// close when clicking outside the modal box
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.classList.add("hidden");
});

// ===== API base =====
const API_BASE = "http://localhost:3001";
function syncWishlistButtons() { // helper so cards show “✓ Wishlisted” after reload/filter 
  const items = getWishlist();
  const set = new Set(items.map(i => i.id));

  document.querySelectorAll(".card").forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector(".wishlist-btn");
    if (!btn) return;

    btn.textContent = set.has(id) ? "✓ Wishlisted" : "♡ Wishlist";
  });
}
async function loadListings(category = null) {
  const url = category
    ? `${API_BASE}/listings?category=${encodeURIComponent(category)}`
    : `${API_BASE}/listings`;

  const res = await fetch(url);
  const listings = await res.json();

  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  listings.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    // IMPORTANT: set these so wishlist + images work
    card.dataset.id = item.listingId || item.id || "";
    card.dataset.cat = item.category || "";
    card.dataset.img = item.image || item.img || ""; // DB should return `image`

    card.innerHTML = `
      <div class="img"></div>
      <h3>${item.title}</h3>
      <p>$${Number(item.price).toFixed(2)} • ${item.category}</p>
      <button class="pill wishlist-btn">♡ Wishlist</button>
    `;

    cards.appendChild(card);
  });

  // Apply background images AFTER cards are created
  applyCardImages();

  // Optional: update button text if already wishlisted
  syncWishlistButtons();
}

// load on page start
loadListings();
// ===== Elements =====
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const btnLoginSubmit = document.getElementById("btnLoginSubmit");
const loginStatus = document.getElementById("loginStatus");

const signupUsername = document.getElementById("signupUsername");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const btnSignupSubmit = document.getElementById("btnSignupSubmit");
const signupStatus = document.getElementById("signupStatus");

// ===== Helpers =====
function setStatus(el, msg, ok = false) {
  el.textContent = msg;
  el.style.color = ok ? "green" : "red";
}

function setLoggedInUI(user) {
  btnProfile.textContent = `Profile (${user.username})`;
  authModal.classList.add("hidden");
}

// ===== Signup =====
btnSignupSubmit.addEventListener("click", async () => {
  signupStatus.textContent = "";

  const username = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (!username || !email || !password) {
    return setStatus(signupStatus, "Please fill in all fields.");
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      return setStatus(signupStatus, data.error || "Signup failed.");
    }

    // store token (optional, but useful)
    if (data.token) localStorage.setItem("token", data.token);

    setStatus(signupStatus, "Account created! You can login now.", true);

    // Clear fields
    signupPassword.value = "";
  } catch (err) {
    setStatus(signupStatus, "Server not responding.");
  }
});

// ===== Login =====
btnLoginSubmit.addEventListener("click", async () => {
  loginStatus.textContent = "";

  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    return setStatus(loginStatus, "Enter username + password.");
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      return setStatus(loginStatus, data.error || "Login failed.");
    }

    if (data.token) localStorage.setItem("token", data.token);

    setStatus(loginStatus, "Login successful!", true);
    setLoggedInUI(data.user);
  } catch (err) {
    setStatus(loginStatus, "Server not responding.");
  }
});
document.querySelectorAll(".category").forEach((btn) => {
  btn.addEventListener("click", () => {
    loadListings(btn.dataset.cat);
  });
});
// ===== WISHLIST (localStorage) =====
const btnWishlist = document.getElementById("btnWishlist");
const wishlistModal = document.getElementById("wishlistModal");
const closeWishlist = document.getElementById("closeWishlist");
const wishlistItems = document.getElementById("wishlistItems");

const WISHLIST_KEY = "petesplaza_wishlist";

// Get wishlist from storage
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

// Save wishlist
function setWishlist(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

// Render wishlist in modal
function renderWishlist() {
  const items = getWishlist();

  if (items.length === 0) {
    wishlistItems.innerHTML = `<p>Your wishlist is empty.</p>`;
    return;
  }

  wishlistItems.innerHTML = items.map(item => `
  <div style="
      display:flex;
      align-items:center;
      gap:15px;
      margin:12px 0;
      padding:8px;
      border-bottom:1px solid #ddd;
  ">
    
    <div style="
        width:60px;
        height:60px;
        background-image:url('${item.image}');
        background-size:cover;
        background-position:center;
        border-radius:8px;
        background-color:#eee;
    "></div>

    <div style="flex:1;">
      <div><b>${item.title}</b></div>
      <div>$${Number(item.price).toFixed(2)} • ${item.category}</div>
    </div>

    <button class="pill" data-remove="${item.id}">Remove</button>

  </div>
`).join("");
}

// Open wishlist modal
btnWishlist.addEventListener("click", () => {
  wishlistModal.classList.remove("hidden");
  renderWishlist();
});

// Close wishlist modal
closeWishlist.addEventListener("click", () => {
  wishlistModal.classList.add("hidden");
});

// Close when clicking outside
wishlistModal.addEventListener("click", (e) => {
  if (e.target === wishlistModal) wishlistModal.classList.add("hidden");
});

// Add-to-wishlist click (event delegation)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".wishlist-btn");
  if (!btn) return;

  const card = btn.closest(".card");
  if (!card) return;

  const id = card.dataset.id || card.getAttribute("data-id");
  const title = card.querySelector("h3")?.textContent?.trim() || "Untitled";
  const info = card.querySelector("p")?.textContent || "";
  const [pricePart, categoryPart] = info.split("•").map(s => s.trim());

  const price = Number((pricePart || "").replace("$", "")) || 0;
  const category = categoryPart || (card.dataset.cat || "Unknown");

  // prevent duplicates
  const image = card.dataset.img || "";

  // prevent duplicates
  const items = getWishlist();
  if (items.some(x => x.id === id)) {
    btn.textContent = "✓ Wishlisted";
    return;
  }

  items.push({ id, title, price, category, image });
  setWishlist(items);

  btn.textContent = "✓ Wishlisted";
});

// Remove from wishlist
wishlistItems.addEventListener("click", (e) => {
  const removeId = e.target.getAttribute("data-remove");
  if (!removeId) return;

  const items = getWishlist().filter(x => x.id !== removeId);
  setWishlist(items);

  // reset the card button text if it exists on page
  const card = document.querySelector(`.card[data-id="${removeId}"]`);
  if (card) {
    const b = card.querySelector(".wishlist-btn");
    if (b) b.textContent = "♡ Wishlist";
  }

  renderWishlist();
});

function applyCardImages() {
  document.querySelectorAll(".card").forEach((card) => {
    const imgPath = card.dataset.img;
    const imgDiv = card.querySelector(".img");

    if (!imgDiv) return;

    if (imgPath) {
      imgDiv.style.backgroundImage = `url("${imgPath}")`;
      imgDiv.style.backgroundSize = "cover";
      imgDiv.style.backgroundPosition = "center";
      imgDiv.style.backgroundRepeat = "no-repeat";
    } else {
      // optional fallback if no image provided
      imgDiv.style.backgroundImage = "none";
    }
  });
}

// run once on page load
applyCardImages();
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
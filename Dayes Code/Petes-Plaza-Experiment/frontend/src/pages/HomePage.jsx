import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WishlistModal from '../components/WishlistModal'
import '../styles/index.css'
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist";
const SAMPLE_LISTINGS = [
  { id: 1, title: 'Graphic T-Shirt', price: 12.99, category: 'T-Shirts', image: '/assets/images/graphic_tshirt.png' },
  { id: 2, title: 'Blue Jeans', price: 29.99, category: 'Jeans', image: '/assets/images/jeans.png' },
  { id: 3, title: 'Running Shoes', price: 45.00, category: 'Shoes', image: '/assets/images/shoes.png' },
  { id: 4, title: 'Office Chair', price: 60.00, category: 'Furniture', image: '/assets/images/office_chair.png' },
  { id: 5, title: 'Backpack', price: 22.00, category: 'Accessories', image: '/assets/images/backpack.png' },
  { id: 6, title: 'Mini Blender', price: 18.50, category: 'Appliances', image: '/assets/images/blender.png' },
]

const PAGE_DESC_MAP = {
  'Home': "Welcome to Pete's Plaza. Use tabs and categories to explore listings.",
  "Men's": "Men's section — browse items made for men.",
  "Women's": "Women's section — browse items made for women.",
  'Accessories': 'Accessories section — bags, hats, jewelry, and more.',
  'Contact Us': 'Contact/support section — add a form or email info here.',
}

const CATEGORIES = ['T-Shirts', 'Jeans', 'Sweatshirts', 'Shoes', 'Appliances', 'Furniture', 'Accessories', 'Other']
const PLACEHOLDER_IMAGE = '/assets/images/image.png';

const getCategoryForListing = (id) => CATEGORIES[(id - 1) % CATEGORIES.length]

export default function HomePage() 
{
  const [activeTab, setActiveTab] = useState('Home')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [error, setError] = useState(null)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState(new Set());
  const { user } = useAuth();

  const pageTitle = selectedCategory || activeTab
  const pageDesc = selectedCategory 
    ? `Showing listings for: ${selectedCategory}`
    : PAGE_DESC_MAP[activeTab] || 'Listings'

  const filteredListings = selectedCategory
    ? listings.filter(item => getCategoryForListing(item.id) === selectedCategory) // Filter listings by selected category
    : listings

  const handleTabClick = (tab) => { // Handle Contact Us tab separately if needed
    setActiveTab(tab)
    setSelectedCategory(null)
  }

  const handleCategoryClick = (cat) => { // When a category is clicked, we want to show that category's listings and update the title/description
    setSelectedCategory(cat)
  }

  const handleCreateListing = () => { // Placeholder for create listing action
    alert('Create a Listing clicked! (Next step: add a form here.)')
  }

  const handleSettings = () => {
    alert('Settings clicked! (Next step: theme/account settings.)')
  }
  useEffect(() => { // Fetch listings from backend API
    const fetchListings = async () => {
      try {
        setLoading(true) // Reset loading and error state before fetching
        setError(null) // Clear previous errors
        const res = await fetch('/api/admin/listings', { credentials: "include" }) // This endpoint should return a list of all listings for the homepage. The backend file referenced is admin.js because the /api/admin/listings endpoint returns all listings regardless of status, while the homepage only shows active listings. The filtering for active listings is done on the frontend by checking the listing.status field.
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        setListings(data)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(`Failed to load listings: ${err.message}`)
        setListings(SAMPLE_LISTINGS)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])
  /* ---------- LOAD USER WISHLIST ---------- */
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (!user) {
          setWishlistIds(new Set());
          return;
        }

        const items = await fetchWishlist();

        // convert listings to a Set of listing IDs
        setWishlistIds(new Set(items.map((x) => x.id)));
      } catch (e) {
        console.log("Wishlist load skipped:", e.message);
      }
    };

    loadWishlist();
  }, [user]);
  const isWishlisted = (id) => wishlistIds.has(id);

const setLoadingFor = (id, on) => {
  setWishlistLoadingIds((prev) => {
    const next = new Set(prev);
    if (on) next.add(id);
    else next.delete(id);
    return next;
  });
};

const handleAddWishlist = async (listingId) => {
  if (!user) {
    setShowAuthModal(true);
    return;
  }

  if (isWishlisted(listingId)) return;

  setLoadingFor(listingId, true);

  // optimistic UI
  setWishlistIds((prev) => new Set(prev).add(listingId));

  try {
    await addToWishlist(listingId);
  } catch (e) {
    // rollback
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(listingId);
      return next;
    });
    alert(e.message);
  } finally {
    setLoadingFor(listingId, false);
  }
};

const handleRemoveWishlist = async (listingId) => {
  setLoadingFor(listingId, true);

  // optimistic UI
  setWishlistIds((prev) => {
    const next = new Set(prev);
    next.delete(listingId);
    return next;
  });

  try {
    await removeFromWishlist(listingId);
  } catch (e) {
    // rollback
    setWishlistIds((prev) => new Set(prev).add(listingId));
    alert(e.message);
  } finally {
    setLoadingFor(listingId, false);
  }
};
  return (
    <div className="page">
      {/* TOP UTILITY BAR */}
      <header className="topbar">
        <div className="top-center">
          <div className="site-header">
            <img src="/assets/images/logo.png" alt="Pete's Plaza Logo" className="header-image" onError={(e) => e.target.style.display = 'none'} />
            <div className="create-title site-title">
              Pete's Plaza
            </div>
          </div>
          <div className="top-buttons">
            <button className="pill" onClick={() => setShowAuthModal(true)}>Profile</button>
            <button className="pill" onClick={() => setShowWishlist(true)}>Wishlist</button>
            <button className="pill" onClick={() => alert('Cart clicked!')}>Cart</button>
            <button className="pill" onClick={() => handleTabClick('Contact Us')}>Contact</button>
            {user?.is_admin && (
              <Link to="/admin">
                <button className="pill">Admin Dashboard</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGATION ROW */}
      <nav className="navrow">
        <div className="tabs">
          {['Home', "Men's", "Women's", 'Accessories', 'Contact Us'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="pill create-btn" onClick={handleCreateListing}>
          Create a Listing
        </button>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebox">
            <div className="sidebox-title">Current Listing</div>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className="category"
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="settings" onClick={handleSettings}>Settings</button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">
          <div className="canvas">
            <h1>{pageTitle}</h1>
            <p>{pageDesc}</p>


            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>⚠ {error} (showing sample data)</div>}
            {loading && <p>Loading listings...</p>}

            <div className="cards">
              {filteredListings.map(listing => {
                const category = getCategoryForListing(listing.id)
                const imgSrc = listing.image && listing.image !== '' ? listing.image : PLACEHOLDER_IMAGE;
                return (
                 <div key={listing.id} className="card">
  <img
    src={imgSrc}
    alt={listing.title}
    className="img"
    onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
  />
  <h3>{listing.title}</h3>
  <p>${Number(listing.price).toFixed(2)} • {category}</p>

  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
    {!isWishlisted(listing.id) ? (
      <button
        className="pill"
        disabled={wishlistLoadingIds.has(listing.id)}
        onClick={() => handleAddWishlist(listing.id)}
      >
        {wishlistLoadingIds.has(listing.id) ? "Adding..." : "❤️ Add to Wishlist"}
      </button>
    ) : (
      <button
        className="pill"
        disabled={wishlistLoadingIds.has(listing.id)}
        onClick={() => handleRemoveWishlist(listing.id)}
      >
        {wishlistLoadingIds.has(listing.id) ? "Removing..." : "✅ Wishlisted"}
      </button>
    )}
  </div>
</div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
        {/* WISHLIST MODAL */}
      <WishlistModal
        open={showWishlist}
        onClose={() => setShowWishlist(false)}
      />
      
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuthModal(false)}>×</button>
            <h2>User Account</h2>
            <div className="auth-forms">
              <div className="auth-box">
                <h3>Login</h3>
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <button className="pill auth-btn">Login</button>
              </div>
              <div className="auth-box">
                <h3>Sign Up</h3>
                <input type="text" placeholder="Username" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button className="pill auth-btn">Create Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

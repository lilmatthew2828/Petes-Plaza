import { useEffect } from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/index.css'
import WishlistModal from '../components/WishlistModal' //Matthew Kilpatrick
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist"; //Matthew Kilpatrick
import { Link } from 'react-router-dom'

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

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
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
    ? listings.filter(item => getCategoryForListing(item.id) === selectedCategory)
    : listings

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setSelectedCategory(null)
  }

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat)
  }

  const handleCreateListing = () => {
    navigate("/listings");
  }

  const handleSettings = () => {
    alert('Settings clicked! (Next step: theme/account settings.)')
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/admin/listings', { credentials: "include" })
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
  }, [location.key, location.state?.refreshListings])

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (!user) {
          setWishlistIds(new Set());
          return;
        }

        const items = await fetchWishlist();
        setWishlistIds(new Set(items.map((x) => x.id)));
      } catch (e) {
        console.log("Wishlist load skipped:", e.message);
      }
    };

    loadWishlist();
  }, [user]);

  const isWishlisted = (id) => wishlistIds.has(id); //Matthew Kilpatrick

  const setLoadingFor = (id, on) => { //Matthew Kilpatrick
    setWishlistLoadingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAddWishlist = async (listingId) => { //Matthew Kilpatrick
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isWishlisted(listingId)) return;

    setLoadingFor(listingId, true);
    setWishlistIds((prev) => new Set(prev).add(listingId));

    try {
      await addToWishlist(listingId);
    } catch (e) {
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

  const handleRemoveWishlist = async (listingId) => { //Matthew Kilpatrick
    setLoadingFor(listingId, true);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(listingId);
      return next;
    });

    try {
      await removeFromWishlist(listingId);
    } catch (e) {
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
            {/* LISTING GRID. The listings should only show if the listing.status === 'active' */}
            <div className="cards">
              {filteredListings.filter(listing => listing.status === "active").map(listing => {
               const category = listing.category || getCategoryForListing(listing.id);
                const imgSrc =
                  listing.image_url ||
                  listing.image ||
                  (listing.image_key && typeof listing.image_key === "string" ? listing.image_key : "") ||
                  PLACEHOLDER_IMAGE;
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

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <Link to={`/listings/${listing.id}`}>
                        <button className="pill">View Listing</button>
                      </Link>

                      <Link to={`/listings/${listing.id}/edit`}>
                        <button className="pill">Edit Listing</button>
                      </Link>

                      {listing.seller_id && (
                        <Link to={`/seller/${listing.seller_email}`}>
                          <button className="pill">View Seller</button>
                        </Link>
                      )}

                      {!isWishlisted(listing.id) ? (
                        <button
                          className="pill"
                          disabled={wishlistLoadingIds.has(listing.id)}
                          onClick={() => handleAddWishlist(listing.id)}
                        >
                          {wishlistLoadingIds.has(listing.id)
                            ? "Adding..."
                            : "Add to Wishlist"}
                        </button>
                      ) : (
                        <button
                          className="pill"
                          disabled={wishlistLoadingIds.has(listing.id)}
                          onClick={() => handleRemoveWishlist(listing.id)}
                        >
                          {wishlistLoadingIds.has(listing.id)
                            ? "Removing..."
                            : "Wishlisted"}
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

      <WishlistModal //Matthew Kilpatrick
        open={showWishlist}
        onClose={() => setShowWishlist(false)}
      />

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
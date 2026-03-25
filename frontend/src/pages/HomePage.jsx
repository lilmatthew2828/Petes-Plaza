import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiTreasureChest } from '@mdi/js';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WishlistModal from '../components/WishlistModal';
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist";
import '../styles/HomePage.css';

const PLACEHOLDER_IMAGE = '/assets/images/placeholder.png';
const PAGE_DESC_MAP = {
  'Home': "Welcome to Pete's Plaza. Use tabs and categories to explore listings.",
  "Men's": "Men's section — browse items made for men.",
  "Women's": "Women's section — browse items made for women.",
  'Accessories': 'Accessories section — bags, hats, jewelry, and more.',
  'Contact Us': 'Contact/support section — add a form or email info here.',
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('Home');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState(new Set());
  const [error, setError] = useState(null);

  const pageTitle = selectedCategory || activeTab;
  const pageDesc = selectedCategory ? `Showing listings for: ${selectedCategory}` : PAGE_DESC_MAP[activeTab] || 'Listings';

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
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/listings', { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error(err);
        setError(`Failed to load listings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [location.key]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) return setWishlistIds(new Set());
      try {
        const items = await fetchWishlist();
        setWishlistIds(new Set(items.map(x => x.id)));
      } catch (e) {
        console.log("Wishlist load skipped:", e.message);
      }
    };
    loadWishlist();
  }, [user]);

  const isWishlisted = (id) => wishlistIds.has(id);

  const setLoadingFor = (id, on) => {
    setWishlistLoadingIds(prev => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAddWishlist = async (id) => {
    if (!user) return setShowAuthModal(true);
    if (isWishlisted(id)) return;

    setLoadingFor(id, true);
    setWishlistIds(prev => new Set(prev).add(id));

    try { await addToWishlist(id); }
    catch (e) {
      setWishlistIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      alert(e.message);
    } finally { setLoadingFor(id, false); }
  };

  const handleRemoveWishlist = async (id) => {
    setLoadingFor(id, true);
    setWishlistIds(prev => { const next = new Set(prev); next.delete(id); return next; });

    try { await removeFromWishlist(id); }
    catch (e) {
      setWishlistIds(prev => new Set(prev).add(id));
      alert(e.message);
    } finally { setLoadingFor(id, false); }
  };

  return (
    <div className="homepage">
      <header className="topbar">
        <div className="logo-container">
          <img src="/assets/images/logo.png" alt="Logo" className="logo" />
        </div>
        <div className="top-buttons">
          <button className="flat-btn" onClick={() => setShowAuthModal(true)}>Profile</button>
          <button className="flat-btn" onClick={() => setShowWishlist(true)}>Wishlist</button>
          <button className="flat-btn" onClick={() => alert('Cart clicked!')}>Cart</button>
          <button className="flat-btn" onClick={() => setActiveTab('Contact Us')}>Contact</button>
          {user?.is_admin && <Link to="/admin"><button className="flat-btn">Admin</button></Link>}
        </div>
      </header>

      <div className="main-layout">
        <Sidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <main className="main-content">
          <div className="hero-banner">
            <img
              src="/assets/images/pete.png"
              alt="Pete the Pirate"
              className="hero-image"
            />
          </div>

          <div className="page-header-row">
            <div className="page-header">
              <h1>{pageTitle}</h1>
              <p>{pageDesc}</p>
            </div>

            <button className="create-listing-btn" onClick={handleCreateListing}>
              Create a Listing
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {loading && <p>Loading listings...</p>}

          <div className="cards-grid">
            {filteredListings
              .filter(listing => listing.status === 'active')  // ✅ Only show active
              .map(listing => {
                const imgSrc = listing.image || PLACEHOLDER_IMAGE;
                return (
                  <div key={listing.id} className="card">
                    <img src={imgSrc} alt={listing.title} onError={e => e.target.src = PLACEHOLDER_IMAGE} />
                    <h3>{listing.title}</h3>
                    <p>${Number(listing.price).toFixed(2)} • {listing.category}</p>
                    <div className="card-actions">
                      <Link to={`/listings/${listing.id}/edit`}>
                        <button className="pill">Edit</button>
                      </Link>

                      <button
                        className="wishlist-btn pill"
                        disabled={wishlistLoadingIds.has(listing.id)}
                        onClick={() =>
                          isWishlisted(listing.id)
                            ? handleRemoveWishlist(listing.id)
                            : handleAddWishlist(listing.id)
                        }
                      >
                        <Icon
                          path={mdiTreasureChest}
                          size={0.8}
                          className={`treasure-icon ${isWishlisted(listing.id) ? 'active' : ''}`}
                        />
                        {isWishlisted(listing.id) ? 'Wishlisted' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
      </div>

      <WishlistModal open={showWishlist} onClose={() => setShowWishlist(false)} />

      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuthModal(false)}>×</button>
            <h2>User Account</h2>
            {/* Login/Signup forms go here */}
          </div>
        </div>
      )}
    </div>
  );
}
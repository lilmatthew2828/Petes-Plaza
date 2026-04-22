import { useEffect, useState } from 'react';
import UserAnnouncements from './UserAnnouncements';
import Icon from '@mdi/react';
import { mdiTreasureChest } from '@mdi/js';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WishlistModal from '../components/WishlistModal';
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist";
import '../styles/HomePage.css';
import { deleteListing } from "../api/listings";


const PLACEHOLDER_IMAGE = '/assets/images/placeholder.png';
const PAGE_DESC_MAP = {
  'Home': "Welcome to Pete's Plaza. Use tabs and categories to explore listings.",
  "Men's": "Men's section — browse items made for men.",
  "Women's": "Women's section — browse items made for women.",
  'Accessories': 'Accessories section — bags, hats, jewelry, and more.',
  'Contact Us': 'Contact/support section — add a form or email info here.',
};
const CATEGORIES = [
  'T-Shirts',
  'Jeans',
  'Sweatshirts',
  'Shoes',
  'Appliances',
  'Furniture',
  'Accessories',
  'Vehicles',
  'Other'
];

// Map old category names to new standardized categories
const normalizeLegacyCategory = (category) => {
  if (!category) return 'Other';
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('shirt') || categoryLower.includes('tee') || categoryLower.includes('clothing') || categoryLower.includes('clothes')) return 'T-Shirts';
  if (categoryLower.includes('jean')) return 'Jeans';
  if (categoryLower.includes('sweatshirt') || categoryLower.includes('hoodie') || categoryLower.includes('sweater')) return 'Sweatshirts';
  if (categoryLower.includes('shoe') || categoryLower.includes('boot')) return 'Shoes';
  if (categoryLower.includes('appliance')) return 'Appliances';
  if (categoryLower.includes('furniture') || categoryLower.includes('table') || categoryLower.includes('chair')) return 'Furniture';
  if (categoryLower.includes('accessory') || categoryLower.includes('accessories') || categoryLower.includes('bag') || categoryLower.includes('hat')) return 'Accessories';
  if (categoryLower.includes('vehicle') || categoryLower.includes('car') || categoryLower.includes('bike') || categoryLower.includes('transportation')) return 'Vehicles';
  
  return 'Other';
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
    ? listings.filter((item) => {
        const normalizedCategory = normalizeLegacyCategory(item.category);
        const matches = normalizedCategory === selectedCategory;
        if (!matches && item.category) {
          console.log(`[HomePage] Filter: "${item.category}" -> "${normalizedCategory}" !== "${selectedCategory}" for "${item.title}"`);
        }
        return matches;
      })
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
        const res = await fetch('/api/listings', { credentials: "include" }); // Emmanuella Obidike 
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("[HomePage] Fetched listings:", data);
        console.log("[HomePage] Sample listing categories:", data.slice(0, 3).map(l => ({ id: l.id, title: l.title, category: l.category })));
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

    const canManageListing = (listing) => {
    if (!user) return false;
    if (user.is_admin) return true;
    return (listing.seller_email || "") === (user.email || "").toLowerCase();
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await deleteListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (e) {
      alert(e.message || "Failed to delete listing");
    }
  };

  return (
    <div className="homepage">
      <header className="topbar">
        <div className="logo-container">
          <img src="/assets/images/logo.png" alt="Logo" className="logo" />
        </div>
        <div className="top-tabs">
          <button className="top-tab" onClick={() => setShowAuthModal(true)}>Profile</button>
          <button className="top-tab" onClick={() => setShowWishlist(true)}>Wishlist</button>
          {user && (
            <Link to="/purchase-history">
              <button className="top-tab">
                Purchase History
              </button>
            </Link>
          )}
          <Link to="/my-sold">
            <button className="top-tab">
              Sold Items
            </button>
          </Link>
          <button className="top-tab" onClick={() => setActiveTab('Contact Us')}>Contact</button>
          {user && <UserAnnouncements userId={user.id} />}
          {user?.is_admin && <Link to="/admin"><button className="top-tab admin-tab">Admin</button></Link>}
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
              .filter(listing => listing.status === 'active')
              .map(listing => {
                const imgSrc = listing.image_url || PLACEHOLDER_IMAGE;
                return (
                  <div key={listing.id} className="card">
                    <img src={imgSrc} alt={listing.title} onError={e => e.target.src = PLACEHOLDER_IMAGE} />
                    <h3>{listing.title}</h3>
                    <p>${Number(listing.price).toFixed(2)} • {listing.category}</p>
                    <div className="card-actions">
                      <Link to={`/listings/${listing.id}`}>
                        <button className="pill">View Listing</button>
                      </Link>

                      {canManageListing(listing) && (
                        <Link to={`/listings/${listing.id}/edit`}>
                          <button className="pill">Edit</button>
                        </Link>
                      )}

                      {listing.seller_email && (
                        <Link to={`/seller/${listing.seller_email}`}>
                          <button className="pill">View Seller</button>
                        </Link>
                      )}

                      {canManageListing(listing) && (
                        <button
                          className="pill"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          Delete Listing
                        </button>
                      )}

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
                        {wishlistLoadingIds.has(listing.id) 
                          ? (isWishlisted(listing.id) ? 'Removing...' : 'Adding...')
                          : (isWishlisted(listing.id) ? 'Wishlisted' : 'Add to Wishlist')
                        }
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
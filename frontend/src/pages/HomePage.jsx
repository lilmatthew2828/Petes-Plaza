import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/index.css'

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

const CATEGORIES = ['T-Shirts', 'Jeans', 'Sweatshirts', 'Shoes', 'Appliances', 'Furniture']

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Home')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const pageTitle = selectedCategory || activeTab
  const pageDesc = selectedCategory 
    ? `Showing listings for: ${selectedCategory}`
    : PAGE_DESC_MAP[activeTab] || 'Listings'

  const filteredListings = selectedCategory
  ? listings.filter(item => item.category === selectedCategory)
  : listings

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setSelectedCategory(null)
  }

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat)
  }

  const handleCreateListing = () => {
    alert('Create a Listing clicked! (Next step: add a form here.)')
  }

  const handleSettings = () => {
    alert('Settings clicked! (Next step: theme/account settings.)')
  }
  useEffect(() => {
  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings')
      const data = await res.json()
      setListings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchListings()
}, [])
  return (
    <div className="page">
      {/* TOP UTILITY BAR */}
      <header className="topbar">
        <div className="top-center">
          <div className="site-header">
            <img src="/assets/images/icon.png" alt="Pete's Plaza Logo" className="header-image" onError={(e) => e.target.style.display = 'none'} />
            <div className="create-title site-title">
              Pete's Plaza
            </div>
          </div>
          <div className="top-buttons">
            <button className="pill" onClick={() => setShowAuthModal(true)}>Profile</button>
            <button className="pill" onClick={() => alert('Wishlist clicked!')}>Wishlist</button>
            <button className="pill" onClick={() => alert('Cart clicked!')}>Cart</button>
            <button className="pill" onClick={() => handleTabClick('Contact Us')}>Contact</button>
            <Link to="/admin">
              <button className="pill">Admin Dashboard</button>
            </Link>
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

            <div className="cards">
              {filteredListings.map(listing => (
                <div key={listing.id} className="card">
                  <img src={listing.image} alt={listing.title} className="img" onError={(e) => e.target.style.display = 'none'} />
                  <h3>{listing.title}</h3>
                  <p>${listing.price.toFixed(2)} • {listing.category}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

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

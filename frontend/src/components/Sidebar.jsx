import React from 'react';
import '../styles/Sidebar.css';

const CATEGORIES = ['T-Shirts', 'Jeans', 'Sweatshirts', 'Shoes', 'Appliances', 'Furniture', 'Accessories', 'Vehicles', 'Other'];

export default function Sidebar({ selectedCategory, onSelectCategory }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Categories</div>
      <div className="category-list">
        <button
          key="view-all"
          className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
          style={{ fontWeight: selectedCategory === null ? 'bold' : 'normal', marginBottom: '12px' }}
        >
          View All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => {
              console.log("[Sidebar] Selected category:", cat);
              onSelectCategory(cat);
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </aside>
  );
}
import React from 'react';
import '../styles/Sidebar.css';

const CATEGORIES = ['T-Shirts', 'Jeans', 'Sweatshirts', 'Shoes', 'Appliances', 'Furniture', 'Accessories', 'Other'];

export default function Sidebar({ selectedCategory, onSelectCategory }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Categories</div>
      <div className="category-list">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </aside>
  );
}
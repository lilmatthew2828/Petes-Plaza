# Pete's Plaza Frontend (React + Vite)

This is the React + Vite version of the Pete's Plaza marketplace frontend.

## Structure

```
frontend/
  index.html           # Entry HTML (Vite loads React here)
  vite.config.js       # Vite configuration
  package.json         # Dependencies
  src/
    main.jsx          # React entry point
    App.jsx           # Main app component with routing
    pages/
      HomePage.jsx    # Home page (converted from index.html)
      AdminDashboard.jsx # Admin dashboard (converted from admin.html)
    styles/
      index.css       # Global styles (from style.css)
      admin.css       # Admin styles
    api/
      admin.js        # API client for admin endpoints
  public/
    assets/
      images/         # Image assets
```

## Setup

1. Install dependencies (one time):
```bash
cd frontend
npm install
```

2. Start dev server (live reload):
```bash
npm run dev
```
Opens automatically at http://localhost:5173

3. Build for production:
```bash
npm run build
```
Creates optimized files in `dist/` folder

4. Preview production build:
```bash
npm run preview
```

## What Changed from Vanilla JS

| Old | New |
|-----|-----|
| `index.html` + `script.js` | `HomePage.jsx` component |
| `admin.html` + `adminDashboard.js` | `AdminDashboard.jsx` component |
| Manual DOM manipulation | React state (`useState`) |
| Multiple HTML files | Single entry point, routing with React Router |
| Event listeners on elements | onClick handlers on JSX elements |

## Key Concepts

**Vite** = Build tool that:
- Compiles JSX → JavaScript
- Hot module replacement (instant reload)
- Fast production builds
- Serves assets

**React** = UI framework that:
- Manages component state (`useState`)
- Renders components based on state
- Handles routing (`<Routes>`, `<Link>`)
- Re-renders automatically when state changes

**JSX** = HTML-like syntax in JavaScript:
```jsx
// JSX
<button onClick={() => alert('clicked')}>Click me</button>

// Compiles to:
React.createElement('button', { onClick: () => alert('clicked') }, 'Click me')
```

## Next Steps

1. **API Integration**: Replace mock data in `AdminDashboard.jsx` with actual API calls (uncomment the `useEffect` code)
2. **Add Pages**: Create more components in `src/pages/` and add routes to `App.jsx`
3. **Routing**: Use `<Link to="/admin">` to navigate between pages
4. **State Management**: For complex state, consider Redux or Context API

## Environment Variables

Create `.env` in `frontend/` for environment-specific config:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Access in code:
```jsx
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## Troubleshooting

- **Port already in use**: Change port in `vite.config.js`
- **Assets not loading**: Ensure they're in `public/` or imported in components
- **Styles not applying**: Check CSS imports and class names in components

# Pete's Plaza Frontend Architecture Guide
## For Backend Developers

This guide explains the React + Vite frontend structure using backend terminology and concepts you already understand.

---

## 1. Quick Analogy: Backend → Frontend

If you're familiar with **Flask** or **FastAPI**:

| Backend Concept | Frontend Equivalent |
|---|---|
| **Route** (`@app.get("/users")`) | **Component** + **Route** (`<Route path="/users" element={<UsersPage />} />`) |
| **Request/Response** | **State** (data stored in component) + **Re-render** (like sending back HTML) |
| **Database Model** | **State** (`useState`) – holds data the UI displays |
| **API Endpoint** | **JavaScript function** that fetches from your API |
| **Middleware** | **React Hooks** (like `useEffect` – runs code at specific times) |
| **JSON responses** | **Props** – data passed between components |
| **Controller logic** | **Component logic** – how data flows and updates |

---

## 2. Overall Flow

```
User opens browser
    ↓
index.html loads (entry point)
    ↓
main.jsx runs (imports App.jsx, sets up React)
    ↓
App.jsx (like main Flask app) 
    - Sets up routes
    - Decides which page to show based on URL
    ↓
HomePage.jsx OR AdminDashboard.jsx renders
    - Fetches data (if needed from backend API)
    - Displays UI
    - Listens for user clicks
    ↓
User clicks a button
    - Event handler runs (like a route handler)
    - State updates
    - Component re-renders with new data
    ↓
Browser shows new UI
```

---

## 3. File-by-File Explanation

### **index.html** (Entry Point)
**What it does:** The single HTML file the browser loads. Like the base template in backend frameworks.

**Backend analogy:** It's the `base.html` that wraps your entire app.

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

- The `<div id="root">` is where React injects all components
- The script loads React and starts the app
- Think of it as the "bootstrapper" for your frontend

**Why only one?** In the old setup you had `index.html` and `admin.html` as separate files. Now React handles switching between pages *in JavaScript* instead of serving different HTML files.

---

### **main.jsx** (Bootstrap/Setup)
**What it does:** The entry point for React. Like `app.py` in Flask.

**Analogy:** This is where you'd do:
```python
app = Flask(__name__)
# Configure app, set up middleware, etc.
# Then run it
if __name__ == '__main__':
    app.run()
```

**What main.jsx does:**
1. Imports React and ReactDOM (like importing Flask)
2. Imports global CSS (applies styles everywhere)
3. Imports the main `App` component
4. Renders App into the `#root` div
5. Tells React to start managing the UI

```javascript
import App from './App.jsx'
import './styles/index.css'  // Global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
```

---

### **App.jsx** (Router/Main Controller)
**What it does:** The "main controller" that decides which page to show.

**Backend analogy:** Like your Flask app's route definitions:
```python
@app.get("/")
def home():
    return render_template("home.html")

@app.get("/admin")
def admin():
    return render_template("admin.html")
```

**What App.jsx does:**
```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/admin" element={<AdminDashboard />} />
</Routes>
```

- `path="/"` = when URL is `/`, show HomePage
- `path="/admin"` = when URL is `/admin`, show AdminDashboard
- No page reloads! React swaps components in memory (faster)

---

### **src/pages/HomePage.jsx** (Page Component)
**What it does:** The homepage. Like your `home.html` template + the logic to populate it.

**Backend analogy:** Combines a route handler + Jinja template:
```python
@app.get("/")
def home():
    listings = db.session.query(Listing).all()
    return render_template("home.html", listings=listings)
```

**What HomePage.jsx does:**

1. **State management** (data the UI shows):
```jsx
const [activeTab, setActiveTab] = useState('Home')
const [selectedCategory, setSelectedCategory] = useState(null)
```
- Like storing temporary variables in a request context
- When `activeTab` changes → component re-renders with new data

2. **Event handlers** (like form submission handlers):
```jsx
const handleTabClick = (tab) => {
  setActiveTab(tab)
  setSelectedCategory(null)
}
```
- When user clicks a tab → this runs
- Updates state → component re-renders

3. **Returns JSX** (the UI):
```jsx
<button onClick={() => handleTabClick('Home')}>Home</button>
```
- Like `<button onclick="...">` in HTML
- But with JavaScript functions instead of strings

---

### **src/pages/AdminDashboard.jsx** (Another Page)
**What it does:** The admin dashboard page with metrics and listings table.

**Backend analogy:** A protected admin route that fetches data:
```python
@app.get("/admin")
def admin_dashboard():
    users = db.session.query(User).count()
    listings = db.session.query(Listing).all()
    return render_template("admin.html", users=users, listings=listings)
```

**Key pattern — useEffect hook:**
```jsx
useEffect(() => {
  // This code runs once when component loads (like @app.before_request)
  const fetchData = async () => {
    const m = await fetch('/api/admin/metrics').then(r => r.json())
    setMetrics(m)
  }
  fetchData()
}, [])
```

- **`useEffect`** = "run this code at specific times"
- The `[]` = "run once when component first renders"
- Like a request lifecycle hook in backend frameworks
- This is where you call your backend API

---

### **src/styles/index.css & admin.css** (Styles)
**What it does:** CSS stylesheets. Exactly like your `.css` files before.

**Backend analogy:** Like static files served by your backend (CSS, images, JS).

**Why two files?**
- `index.css` = global styles (applied everywhere)
- `admin.css` = admin-specific styles

Each page imports its CSS:
```jsx
import '../styles/admin.css'  // AdminDashboard.jsx
import '../styles/index.css'  // HomePage.jsx
```

---

### **src/api/admin.js** (API Client)
**What it does:** Functions that call your backend API.

**Backend analogy:** Like having a "database connection module" on the backend.

```javascript
export async function fetchMetrics() {
  const res = await fetch('/api/admin/metrics')
  return res.json()
}
```

- `fetch()` = HTTP request to your backend
- `.json()` = parse the response (like `response.json()` in Python)
- `export` = make it available to other files

**How it's used in AdminDashboard.jsx:**
```jsx
import { fetchMetrics } from '../api/admin.js'

useEffect(() => {
  const metrics = await fetchMetrics()
  setMetrics(metrics)
}, [])
```

---

### **package.json** (Dependencies)
**What it does:** Lists all npm packages (like `requirements.txt` in Python).

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

- **dependencies** = packages needed to run the app (like Flask)
- **devDependencies** = packages only needed for development (like pytest)
- `npm install` = download all packages (like `pip install -r requirements.txt`)

---

### **vite.config.js** (Build Configuration)
**What it does:** Tells Vite how to build and serve the app.

**Backend analogy:** Like Flask's `app.config['DEBUG'] = True` or gunicorn settings.

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

- Enables React plugin (so Vite understands JSX)
- Sets dev server to port 5173
- `open: true` = automatically opens browser when you run `npm run dev`

---

## 4. Data Flow Example

**User clicks a category button:**

```
User clicks "T-Shirts" button
    ↓
onClick handler runs: handleCategoryClick('T-Shirts')
    ↓
setSelectedCategory('T-Shirts') executes
    ↓
React detects state changed
    ↓
Component re-renders (runs JSX again)
    ↓
JSX filters listings: listings.filter(item => item.category === 'T-Shirts')
    ↓
New filtered list renders in DOM
    ↓
User sees only T-Shirts
```

**Compare to backend:**
```python
@app.get("/listings")
def get_listings(category=None):
    query = db.session.query(Listing)
    if category:
        query = query.filter(Listing.category == category)
    return jsonify([l.to_dict() for l in query.all()])

# User clicks button → browser makes GET /listings?category=T-Shirts → endpoint runs
```

Same logic, but on the frontend instead!

---

## 5. Key Concepts for Backend Devs

### **State (useState)**
**Like:** Variables in a request context or session

```jsx
const [count, setCount] = useState(0)
```

- `count` = current value
- `setCount(5)` = update it (like `request.session['count'] = 5`)
- When state changes → component re-renders

### **Props**
**Like:** Function parameters or passing data between routes

```jsx
<Listing title="Shoes" price={29.99} />

function Listing({ title, price }) {
  // Use title and price here
}
```

### **Side Effects (useEffect)**
**Like:** Middleware or startup hooks

```jsx
useEffect(() => {
  // Runs after component renders
  fetchData()
}, [dependency])  // Only run if 'dependency' changes
```

### **Conditional Rendering**
**Like:** `if` statements in your template

```jsx
{loading && <p>Loading...</p>}
{error && <p>Error: {error}</p>}
{listings.map(l => <ListingCard key={l.id} listing={l} />)}
```

---

## 6. Request Flow: Calling Your Backend API

```
Frontend (React component)
    ↓ (HTTP request)
Backend API (your Flask/FastAPI app)
    ↓
Database
    ↓ (returns data)
Backend API
    ↓ (JSON response)
Frontend (receives data)
    ↓ (setState)
Component re-renders with new data
```

**Example:**
```jsx
useEffect(() => {
  fetch('/api/admin/metrics')
    .then(res => res.json())
    .then(data => setMetrics(data))
    .catch(err => setError(err))
}, [])
```

This is **your frontend calling your backend**. Make sure:
1. Backend endpoint exists (`GET /api/admin/metrics`)
2. Backend returns JSON
3. Frontend `fetch` matches the URL and method
4. CORS is configured if frontend and backend are on different origins

---

## 7. Development Workflow

```bash
# Start dev server (hot reload, dev tools)
npm run dev
# → Opens http://localhost:5173
# → Code changes auto-reload in browser

# Build for production (optimized, minified)
npm run build
# → Creates dist/ folder with optimized files

# Preview production build
npm run preview
# → Tests production build locally
```

---

## 8. Debugging Tips

**Like backend debugging:**

1. **Browser DevTools Console** (F12 → Console tab)
   - Like `print()` statements
   - Errors show here
   - Type `console.log(variable)` to debug

2. **React DevTools extension**
   - Shows component tree, state, props
   - Like a debugger for components

3. **Network tab** (F12 → Network)
   - See all API calls to your backend
   - Like curl requests
   - Check response status and body

4. **Add `console.log()` in your code:**
   ```jsx
   useEffect(() => {
     console.log('Component loaded')
     fetchData()
   }, [])
   ```

---

## Summary

**Old approach (your original code):**
- Multiple HTML files served separately
- Browser fetches `index.html` → runs script.js
- Script manually manipulates DOM with `querySelector`, `addEventListener`
- Multiple page reloads

**New approach (React + Vite):**
- Single HTML file + one JavaScript bundle
- React manages state and re-rendering
- Components declare UI with JSX
- Client-side routing (no page reloads)
- Much faster and easier to maintain

**Think of it as:** Your frontend is now a small backend app that manages its own state and renders HTML based on that state!


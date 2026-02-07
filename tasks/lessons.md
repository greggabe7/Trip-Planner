# Lessons Learned

## Session: Feb 6, 2026

### Function Call Ordering with Firebase Listeners
**Problem**: `updateCountdown()` was called in `showTripView()` before `attachTripListeners()`, but `attachTripListeners()` is what sets `currentTripId`. So `trips[currentTripId]` resolved to `trips[null]` → undefined → banner hidden.

**Root Cause**: `showHomeScreen()` sets `currentTripId = null`. When navigating to a trip, the call order was:
1. `updateCountdown()` — runs with `currentTripId = null` → hides banner
2. `attachTripListeners(tripId)` — sets `currentTripId = tripId` (too late)

**Fix**: Move `updateCountdown()` to after `attachTripListeners(tripId)`.

**Rule**: When a function depends on global state set by another function, always verify the call order. Don't assume the state is already set.

---

### Firebase Async Data + UI Rendering Race Conditions
**Problem**: Firebase `on('value')` listeners fire asynchronously. UI rendering code that depends on Firebase data may run before the data arrives.

**Fix**: Call UI update functions both:
1. In the initial render path (optimistic, in case data is cached)
2. In the Firebase listener callback (ensures update when data arrives)

```javascript
db.ref('trips').on('value', (snapshot) => {
  trips = snapshot.val() || {};
  if (currentView === 'trip') updateCountdown(); // Re-trigger when data arrives
});
```

**Rule**: For Firebase-backed UI, always hook UI updates into both the initial render AND the data listener.

---

### Browser Caching with Local Dev Server
**Problem**: Python `http.server` doesn't set cache-busting headers. After editing files, the browser may serve stale JS/CSS.

**Symptoms**: Code changes confirmed in the file but not reflected in browser behavior. Manual JS calls work but automatic calls don't.

**Fix**: Use cache-busting query params (`?v=2`), hard refresh (Cmd+Shift+R), or `location.reload(true)`.

**Rule**: When debugging "code not working" on a local server, always rule out browser caching first.

---

## Session: Feb 4, 2026

### HTML5 Drag-and-Drop Click Prevention
**Problem**: When implementing drag-and-drop on clickable elements, the click event fires after dragend, causing unintended navigation/actions.

**Bad Approach**:
```javascript
// Checking classList during click doesn't work - class is already removed
card.addEventListener('click', (e) => {
  if (!card.classList.contains('dragging')) { // Always false!
    expandCategory(card.dataset.category);
  }
});
```

**Good Approach**:
```javascript
let justDragged = false;

function handleDragStart(e) {
  justDragged = true;
  // ...
}

function handleDragEnd(e) {
  // Clear flag AFTER click would have fired
  setTimeout(() => { justDragged = false; }, 100);
}

card.addEventListener('click', (e) => {
  if (!justDragged) {
    expandCategory(card.dataset.category);
  }
});
```

**Rule**: Use a flag with setTimeout to prevent click after drag, not classList checks.

---

### Event Listeners vs Inline Handlers for Drag-and-Drop
**Problem**: Using inline `ondragstart="handler(event, ${idx})"` with dynamic indices breaks after DOM reordering.

**Solution**: Use `addEventListener` after rendering, which captures the element directly:
```javascript
card.addEventListener('dragstart', handleDragStart);
// In handler, use e.target.closest() to get the element
```

**Rule**: For drag-and-drop, prefer addEventListener over inline handlers when elements can be reordered.

---

### Direct Manipulation UX
**Learning**: Users prefer direct manipulation (dragging items where they see them) over indirect methods (opening settings modal to reorder).

**Example**: Category reordering was first implemented in a settings modal, but user wanted to drag the category cards directly on the dashboard.

**Rule**: When possible, let users manipulate items directly in context rather than through separate UI.

---

### Layered vs View Filters
**Pattern**: The app has two kinds of filters:
1. **View filters** (mutually exclusive): To Do, Shopping, Full List — these change *what* items you see
2. **Layered filters** (independent): Unpacked, Packed, Done — these filter *within* the current view

**Key Insight**: When a view filter (like To Do) hard-codes filtering logic (e.g., always hiding done items), it removes the ability to layer additional filters on top. Better to show all items in the view by default and let layered filters handle the narrowing.

**Before**: `return list.filter(([, it]) => it.category === 'To Do' && !it.packed)` — no way to see done items
**After**: `list = list.filter(([, it]) => it.category === 'To Do')` — Done toggle controls visibility

**Rule**: Keep view filters responsible only for selecting the item set. Let layered toggle filters handle show/hide of subsets within that view.

---

### Category-Scoped Filters
**Pattern**: When a filter only applies to a specific category (like "Done" for To Do items), scope the filter logic to that category so it doesn't affect unrelated items:

```javascript
if (viewHideDone) {
  list = list.filter(([, it]) => {
    if (it.category === 'To Do') return !it.packed;
    return true; // Don't filter non-To Do items
  });
}
```

**Rule**: Scope category-specific filters so they don't have side effects on other categories.

---

### Mutually Exclusive Filters
**Pattern**: When filters should be mutually exclusive, explicitly disable the other when enabling one:

```javascript
if (which === 'unpacked') {
  viewUnpackedOnly = !viewUnpackedOnly;
  if (viewUnpackedOnly) viewPackedOnly = false; // Explicitly turn off
  document.getElementById('togglePacked')?.classList.remove('active');
  // ...
}
```

**Rule**: Don't rely on users to turn off conflicting filters - handle it automatically.

---

## Session: Feb 3, 2026

### Service Worker Caching Issues
**Problem**: Browser was showing wrong website content due to service worker caching from a different project.

**Root Cause**: Python HTTP server was running from the wrong directory (`Family-Website` instead of `Mammoth Trip App`), but service worker had cached the old content.

**Solution**:
1. Check server's working directory: `lsof -p <pid> | grep cwd`
2. Unregister service workers: `navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))`
3. Clear caches: `caches.keys().then(names => names.forEach(name => caches.delete(name)))`
4. Kill and restart server from correct directory
5. Hard refresh browser (Cmd+Shift+R)

**Rule**: Always verify the server's working directory when content seems stale or wrong.

---

### Category-Specific Behavior Pattern
**Pattern**: When categories need different behaviors (packable vs non-packable, tasks vs items), use a property on the category definition rather than hardcoding category names.

**Good**:
```javascript
const cat = CATEGORIES.find(c => c.name === item.category);
const isPackable = cat?.isPackable !== false; // Default to true
```

**Bad**:
```javascript
if (item.category === 'Meal Ideas') { ... } // Hardcoded name
```

**Rule**: Add properties to category definitions for behavioral variations, not name checks.

---

### Progress Tracking Separation
**Learning**: When different item types have different completion semantics (packing vs completing tasks), they should have:
1. Separate progress bars/trackers
2. Different terminology ("packed" vs "completed")
3. Independent statistics
4. Visual differentiation (different colors, icons)

**Rule**: Don't mix items with different completion semantics in the same progress indicator.

---

### Testing Browser Changes
**Process**: When making UI changes:
1. Make the code change
2. Hard refresh the browser (Cmd+Shift+R)
3. If still showing old content, check for service worker issues
4. Verify the server is running from the correct directory
5. Take screenshot to verify changes visually

**Rule**: Always visually verify changes in the browser, don't assume the code change is reflected.

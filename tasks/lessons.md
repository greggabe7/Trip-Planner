# Lessons Learned

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

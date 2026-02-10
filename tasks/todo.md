# Trip Planner App - Task Tracking

## Session: Feb 9, 2026

### Completed This Session

- [x] **Feature**: Enhanced category modal — emoji picker grid (30 presets + custom input), isPackable toggle, keywords input
- [x] **Feature**: "+" card on category dashboard for quick category creation
- [x] **Feature**: Edit category support — edit button in expanded category header, pre-fills modal with existing values
- [x] **Feature**: Delete category support — confirmation dialog, moves items to Miscellaneous, cleans up categoryOrder
- [x] **Feature**: Custom auto-categorization keywords — stored in Firebase, checked before static keyword map
- [x] **Bug Fix**: Firebase categories listener now round-trips `isPackable` and `keywords` properties
- [x] **Bug Fix**: Default categories can be edited (saved as custom override), custom categories can be deleted
- [x] **UX**: Rename propagates to all items and categoryOrder atomically

---

## Session: Feb 6, 2026

### Completed This Session

- [x] **Feature**: Added visual countdown progress bar with mountain + skier icon that travels along the bar as trip approaches
- [x] **Feature**: Bar color transitions from blue (far out) → blue-to-green (4-7 days) → green (1-3 days), with red for past trips
- [x] **Bug Fix**: Fixed countdown banner not appearing on initial trip load (updateCountdown was called before currentTripId was set by attachTripListeners)
- [x] **Bug Fix**: Added updateCountdown() call in Firebase trips listener so banner updates when trip data arrives asynchronously
- [x] **Feature**: Added "Done" filter toggle for To Do list — hides completed tasks when active, styled like packed/unpacked toggles

---

## Session: Feb 4, 2026

### Completed This Session

- [x] **Feature**: Added drag-and-drop reordering within categories (native HTML5 drag-and-drop)
- [x] **Code Quality**: Extracted inline styles to CSS utility classes (u-flex, u-btn, u-text, etc.)
- [x] **Code Quality**: Added Firebase error handling wrapper (`fbOperation()` function)
- [x] **Code Quality**: Added loading states for bulk import and reset operations
- [x] **Feature**: Added bulk add mode - add multiple items at once with textarea input
- [x] **Feature**: Added offline queue with localStorage backup for data safety
- [x] **Feature**: Added category reordering via drag-and-drop (persisted to Firebase)
- [x] **Feature**: Added export to PDF with print-optimized checklist layout
- [x] **Feature**: Added direct drag-and-drop on category cards (dashboard view)
- [x] **Feature**: Added "Packed" filter toggle (mutually exclusive with Unpacked)

---

## Session: Feb 3, 2026

### Completed This Session

- [x] **Bug Fix**: Fixed hardcoded "Clothes and Gear" category checks to use `requiresAssignment` property
- [x] **Feature**: Added real-time search bar to filter items across all categories
- [x] **Feature**: Added departure date countdown in header with edit capability
- [x] **Feature**: Made "Meal Ideas" a non-packable category (bullets instead of checkboxes, excluded from stats)
- [x] **Feature**: Added separate To Do task tracker with its own progress bar
- [x] **UX**: To Do items use "completed" terminology instead of "packed"
- [x] **UX**: Header stats show task count separately (X/Y tasks)

---

## Planned: Trip Templates + Category Picker

### Overview
Add named templates (e.g., "Mammoth Trip", "Hawaii Trip") and a category picker so new trips start with exactly the right categories. Uses `hiddenCategories` approach for backward compatibility — existing trips unaffected.

### Steps
- [ ] Add `templates` and `hiddenCategories` global state + Firebase listeners
- [ ] Modify categories listener to filter defaults by `hiddenCategories`
- [ ] Replace clone section in create-trip modal with "Start with..." radio group (All categories / From template / Choose categories / Clone existing trip)
- [ ] Modify `openCreateTripModal()` to reset radio and sub-panels
- [ ] Modify `saveTrip()` to branch on all four modes (all/template/pick/clone)
- [ ] Implement `applyTemplate()`, `applyPickedCategories()`, `gatherAllUniqueCategories()`, `renderCategoryChecklist()`, `populateTemplateDropdown()`, `previewTemplate()`
- [ ] Add "Save as Template" to trip settings menu (`saveAsTemplatePrompt()`)
- [ ] Add "Manage Templates" to app settings with rename/delete support
- [ ] Update `cloneTripData()` to also copy `hiddenCategories`
- [ ] Hide "Start with..." section when modal is reused for Edit Trip
- [ ] Clean up old clone checkbox/toggle code

### Key Architecture
- **Templates** stored at `templates/{id}/` in Firebase with full category list
- **`hiddenCategories`** stored at `trips/{tripId}/appState/hiddenCategories` — array of default category names to suppress
- **No migration needed** — new Firebase paths created on first use
- **Full plan details**: `.claude/plans/hidden-roaming-ritchie.md`

---

### Remaining Items from Review

#### UX Improvements
- [ ] Add swipe gestures for mobile (swipe to mark packed/unpacked)
- [ ] Add bulk actions (select multiple items to delete/move)
- [ ] Improve empty state messaging per category
- [ ] Add keyboard shortcuts for power users (e.g., `/` to focus search)

#### Feature Ideas
- [ ] Add item notes/comments field
- [ ] Add photo attachments for items
- [ ] Add trip templates (save a trip as a reusable template)
- [ ] Add sharing/collaboration improvements (show who added/modified items)
- [ ] Add dark mode support
- [ ] Add undo/redo for recent actions

#### Code Quality
- [ ] Add unit tests for core functions

#### Quick Wins
- [ ] Add haptic feedback on mobile when checking items
- [ ] Add sound effect option when completing items
- [ ] Add confetti animation when 100% packed
- [ ] Add "last modified" timestamp display

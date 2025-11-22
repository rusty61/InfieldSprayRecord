# Design Guidelines: Infield Spray Record Web App

## Design Approach

**Selected Framework**: Material Design 3 adapted for agricultural/industrial applications
**Rationale**: Information-dense forms, mobile-first field usage, offline reliability, and clear visual hierarchy for compliance-critical data entry.

## Design Principles

1. **Field-First Efficiency**: Every interaction optimized for outdoor, one-handed mobile use
2. **Data Clarity**: Clear visual hierarchy separating input forms from calculated totals
3. **Touch-Optimized**: Minimum 44px touch targets, generous spacing between interactive elements
4. **Offline Transparency**: Clear visual feedback for sync status and cached data
5. **Compliance Confidence**: Visual distinction between editable and immutable audit data

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter 400, 500, 600
- Code/Numbers: Inter 500, 600 (tabular numerals for data alignment)

**Type Scale**:
- Page Titles: text-2xl font-semibold (24px)
- Section Headers: text-lg font-semibold (18px)
- Form Labels: text-sm font-medium (14px)
- Input Text: text-base (16px - prevents iOS zoom)
- Helper Text: text-sm (14px)
- Data Tables: text-sm font-medium
- Calculated Totals: text-xl font-semibold (20px)
- Small Metadata: text-xs (12px)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (8px, 16px, 24px, 32px)

**Container Strategy**:
- Mobile: px-4 (16px side margins)
- Desktop: max-w-6xl mx-auto px-6
- Form containers: max-w-2xl for optimal readability

**Vertical Rhythm**:
- Section spacing: space-y-6 (24px between major sections)
- Form field groups: space-y-4 (16px between fields)
- Inline elements: gap-2 or gap-4 (8px or 16px)
- Page padding: py-6 on mobile, py-8 on desktop

**Grid Patterns**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2-column for summary cards (md:grid-cols-2)
- Desktop: 3-column max for chemical lists (lg:grid-cols-3)

---

## Component Library

### Navigation & Shell

**App Header** (Persistent top bar):
- Fixed position with backdrop blur
- Height: h-14 (56px) minimum touch-friendly
- Contains: Menu button, page title, sync status indicator, user avatar
- Shadow: Drop shadow when scrolled

**Bottom Navigation** (Mobile primary nav):
- Fixed bottom bar, h-16 (64px)
- 4 primary actions: Dashboard, New Application, Records, Settings
- Active state: Icon with label, inactive: Icon only
- Icon size: w-6 h-6 with p-3 touch area

**Sidebar Navigation** (Desktop):
- Left sidebar, w-64 (256px)
- Collapsible to icon-only mode
- Grouped sections: Records, Configure, Admin

### Form Components

**Input Fields**:
- Height: h-12 (48px) for touch optimization
- Border: 2px solid with rounded-lg (8px)
- Label position: Above input with mb-2
- Required indicator: Red asterisk (*)
- Error state: Border change + text-sm error message below

**Number Inputs** (Critical for rates/areas):
- Right-aligned text (text-right) for easier scanning
- Unit suffix displayed inline (e.g., "L/ha" in lighter weight)
- Large tap targets for +/- steppers if used
- Keyboard type="decimal" for mobile numeric keyboard

**Select Dropdowns**:
- Height: h-12 matching text inputs
- Searchable for long lists (farms, paddocks, chemicals)
- Multi-select with chip display for paddock selection

**Date/Time Picker**:
- Large calendar grid with h-12 day cells
- "Now" quick action button prominently placed
- Timezone indicator always visible (Australia/Sydney)

### Data Display

**Summary Cards**:
- Rounded-xl (12px) corners
- Padding: p-6
- Stacked layout: Label (text-sm) + Value (text-2xl font-semibold)
- Use grid-cols-2 md:grid-cols-3 for metrics display

**Tank Mix Builder**:
- Chemical item cards with border-l-4 accent
- Each card: p-4 with rounded-lg
- Clear visual separation: Chemical name (font-semibold) + Rate input + Unit selector + Remove button
- Running totals sticky footer on mobile

**Data Tables** (Application history):
- Responsive: Card layout on mobile, table on desktop
- Row height: h-14 for comfortable tap targets
- Alternating row visual treatment for scannability
- Sortable column headers with clear arrow indicators
- Actions column: Icon buttons (Edit, View, Export)

**Weather Display Card**:
- Grid layout: 2x2 for four metrics (wind speed, direction, temp, humidity)
- Large icons from Heroicons (weather-related subset)
- Value: text-xl font-semibold, Unit: text-sm
- Timestamp: text-xs at bottom
- Warning indicators if outside compliance range

**GPS Coordinates Display**:
- Monospaced numbers for precision
- Accuracy indicator (± meters)
- "Refresh Location" button with GPS icon

### Interactive Elements

**Primary Actions** (Start Application, Save Mix):
- Full-width on mobile (w-full)
- Height: h-12
- Rounded-lg
- Font: text-base font-semibold
- Icon + Text for clarity

**Secondary Actions** (Cancel, Back):
- Height: h-12
- Bordered variant
- Ghost variant for tertiary actions

**Icon Buttons** (Delete, Edit, More):
- Size: w-10 h-10 minimum
- Rounded-lg
- Clear hover/active states

**Floating Action Button** (New Record - mobile):
- Size: w-14 h-14
- Fixed position: bottom-20 right-4 (above bottom nav)
- Rounded-full
- Drop shadow-lg
- Icon: Plus from Heroicons

### Status & Feedback

**Sync Status Indicator** (Header):
- Dot indicator: w-2 h-2 rounded-full
- States: Synced (steady), Syncing (pulse), Offline (static)
- Text label on desktop, icon only on mobile

**Loading States**:
- Skeleton screens for data loading
- Spinner only for actions (saving, calculating)
- Progress bar for uploads/sync

**Toast Notifications**:
- Fixed bottom positioning (above bottom nav if present)
- Auto-dismiss after 4 seconds
- Action button for undo/retry

**Audit Trail Badge**:
- Small pill shape (rounded-full px-3 py-1)
- Read-only indicator for locked records
- Timestamp + user info in text-xs

### Maps & Spatial

**Paddock Map** (If implemented):
- Minimum height: h-64 on mobile, h-96 on desktop
- Rounded-lg container
- Controls: Bottom-right positioning
- Selected paddocks: Highlighted boundary with fill opacity

---

## Specialized Patterns

### Offline-First Indicators
- Clear "Offline Mode" banner at top when disconnected
- Queued items shown with pending badge
- Retry button for failed syncs

### Calculation Display
- Instant feedback as user types
- Totals in dedicated card with distinct visual treatment
- Unit conversions shown inline (e.g., "40.8 L (408 × 100mL)")

### Audit View
- Immutable records have locked icon indicator
- Edit history expandable accordion
- Diff view: Side-by-side or inline with change highlighting

---

## Mobile-Specific Optimizations

- Sticky section headers when scrolling long forms
- Bottom-sheet modals for selectors (easier thumb access)
- Swipe gestures for table rows (swipe left reveals actions)
- Form field autofocus prevention on page load (prevents unwanted keyboard)
- Pull-to-refresh for record lists

---

## Accessibility

- Semantic HTML throughout (nav, main, aside, article)
- ARIA labels for icon-only buttons
- Focus visible states with 2px offset ring
- Minimum contrast ratio 4.5:1 for all text
- Form validation announces errors to screen readers

---

## Images

This application does not require hero images or decorative photography. All visual elements are functional:
- Weather icons (from Heroicons weather set)
- Chemical product icons (if available from chemical database)
- Map tiles (OpenStreetMap or satellite for paddock boundaries)
- User avatars (initials fallback if no photo)
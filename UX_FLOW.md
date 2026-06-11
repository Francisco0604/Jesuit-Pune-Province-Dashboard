# Jesuit Pune Province Activity Map - User Experience (UX) Flow

## 1. Overview
The website is designed to be a professional, visually rich portal for visualizing the diverse activities of the Jesuit Pune Province. It transitions from a narrative introduction to a data-driven interactive experience.

## 2. Website Structure

### A. Landing Page (Home) - `/`
A clean, elegant page using a "Parchment & Charcoal" aesthetic to reflect the heritage and mission of the Jesuits.

1.  **Hero Section:**
    *   **Visual:** A high-quality background image or a stylized SVG map of Maharashtra.
    *   **Headline:** "Jesuit Pune Province: Mission in Motion."
    *   **Sub-headline:** "Visualizing our commitment to Faith, Justice, and Education across the province."
    *   **CTA Button:** "Explore Activity Map" (Scrolls to Map or links to `/map`).

2.  **Introduction Section ("Our Presence"):**
    *   Brief text explaining the four core pillars: **Parishes, NFE Centres, Social Justice, and TDSS**.
    *   Static statistics (e.g., "50+ Villages", "4 Districts", "1000+ Families").

3.  **Instructional Section ("How to Use"):**
    *   **Icon 1 (Search):** Find specific villages or clusters using the sidebar.
    *   **Icon 2 (Filter):** Toggle categories (e.g., show only NFE Centres).
    *   **Icon 3 (Click):** Click a pin to see detailed village data, established year, and family counts.
    *   **Icon 4 (Navigate):** Zoom into district boundaries to see local impact.

4.  **Embedded Map Preview:**
    *   A smaller, non-interactive or simplified version of the map to give a "taste" of the data.

5.  **Footer:**
    *   Contact Info, Province Links, and a link to the **Admin Dashboard**.

---

### B. Interactive Map Page - `/map`
The full-screen interactive experience.

*   **Left Sidebar:** Advanced filtering and village search.
*   **Main Area:** High-performance Leaflet map with clustering and GeoJSON boundaries.
*   **Right/Bottom Drawer:** Appears when a village is clicked, showing rich metadata and history.

---

## 3. User Journey (Flow)

1.  **Arrival:** User lands on the professional intro page.
2.  **Education:** User reads about the mission and "How to Use" instructions.
3.  **Engagement:** User clicks "Explore Map" and is seamlessly transitioned to the interactive map.
4.  **Discovery:** User clicks a **Purple Pin (NFE Centre)** in **Beed**.
5.  **Information:** A drawer slides out showing "Village X: 45 Families, Established 1998, Focus: Women's Literacy".
6.  **Action (Admin):** Staff members navigate to `/admin` to upload new GeoJSON files and update records.

---

## 4. Visual Language
*   **Primary Palette:** 
    *   #f5f5dc (Parchment) - Background
    *   #2d2d2d (Charcoal) - Text & Primary Buttons
    *   #a34436 (Terracotta) - Heritage/Parish color
    *   #c5a059 (Gold) - Accents
*   **Typography:** Serif for headlines (Heritage), Sans-serif for data (Clarity).

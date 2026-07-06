# Website Flowchart (User Click Map)

Below is the visual flowchart of the website from the user's point of view. It maps out each screen, the clicks available on it, and where those clicks lead.

![User Click Flowchart Diagram](file:///C:/Users/franc/Projects/Map/Code/user_flowchart.jpg)

---

## Detailed Click Interactions

### 1. Landing Page (Home)
* **Sticky Header**: 
  * Click **"About"** ➔ Navigates to the **About Us Page** (`/about`)
  * Click **"News"** ➔ Navigates to the **General News Page** (`/news`)
  * Click **"Map"** ➔ Navigates to the **Interactive Map Page** (`/map`)
  * Click **"Connect"** ➔ Opens the Connect Modal overlay
* **Hero Section**:
  * Click **"Our Projects"** ➔ Navigates to the **Projects Directory** (`/projects`)
* **News Feed Grid**:
  * Click any **News Card** ➔ Navigates to that full news article detail page (`/news/:id`)
* **Footer**:
  * Click **"About Us"** / **"News"** / **"Map"** ➔ Navigates to respective pages
  * Click **"Contact"** ➔ Opens the Connect Modal overlay
  * Click **"Admin Portal"** ➔ Navigates to the secure `/admin` dashboard
  * Click **"Province Website"** ➔ Opens the external site in a new tab

---

### 2. About Us Page (`/about`)
* Browse static layout documenting the history and heritage.
* View structural hierarchy of roles (Information Manager, GIS Specialist, Web Developer) to understand how data is collected and managed.

---

### 3. General News Page (`/news`)
* Displays general province-level updates (does not contain project specific fieldwork reports/articles).
* Click **News Card** ➔ Opens the **News Detail View** (`/news/:id`) to read content.

---

### 4. Projects Directory Page (`/projects`)
* Click **"TDSS"** ➔ Navigates to the **TDSS Hub** (`/projects/tdss`)
* Click **"Parish"** ➔ Navigates to the **Parish Hub** (`/projects/parish`)

---

### 5. TDSS Hub (`/projects/tdss`)
* Click **"Articles"** ➔ Navigates to the dedicated **TDSS Articles list** (`/projects/tdss/articles`)
* Click **"NFE Centres"** ➔ Navigates to the **NFE Centres Detail** (`/projects/tdss/nfe`)

---

### 6. NFE Centres Detail Page (`/projects/tdss/nfe`)
* View NFE description and dynamic statistics (student counts, active teachers).
* Click **"Explore Maps"** ➔ Navigates to the interactive map (`/map`) with the NFE Centres filter pre-selected.
* Click **"Check Published Articles"** ➔ Navigates to the dedicated **NFE Articles list** (`/projects/tdss/nfe/articles`).

---

### 7. Dedicated Project Articles Pages
* **TDSS Articles** (`/projects/tdss/articles`) & **NFE Articles** (`/projects/tdss/nfe/articles`):
  * Click **Article Card** ➔ Opens the specific detail layout.
  * Click **Village / Location Tags** inside the article ➔ Redirects the user to the Map Page (`/map`) centered and focused on that specific village pin.

---

### 8. Connect Modal (Overlay)
* Click **Form Input Fields** ➔ Enter contact details (Name, Email, Message)
* Click **"Submit"** ➔ Triggers verification, sends contact details, and displays success state
* Click **"X" (Close button)** or backdrop ➔ Closes the modal and returns to the current page

---

### 9. Interactive Map Page (`/map`)
* **Sidebar Controls**:
  * Click **Search bar** ➔ Type and filter matching villages
  * Click **Category checkboxes** (Parish / NFE / Social Justice / TDSS) ➔ Toggles marker visibility on map
  * Click **District/Cluster dropdowns** ➔ Zooms and filters markers for that region
* **Map Canvas**:
  * Click **Zoom (+/-)** or **Double-Click** ➔ Changes map zoom level
  * Click **Marker Pin** ➔ Displays the slide-out **Detail Drawer**
* **Detail Drawer**:
  * Click **"X"** close button ➔ Closes the drawer and returns focus to the map view

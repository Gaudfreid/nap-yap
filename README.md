# Nap & Yap Staycation — Website

## Structure
```
nap-yap-website/
├── index.html          Home
├── gallery.html         Full photo gallery
├── amenities.html       Full amenity list + clubhouse
├── rates.html            Pricing, policies, referral promo
├── attractions.html     Nearby attractions
├── booking.html          Booking inquiry form
├── contact.html          Contact form
├── assets/
│   ├── css/style.css    Design system (tokens, components, animations)
│   ├── js/main.js        Nav, mobile menu, scroll-reveal, FAQ accordion
│   └── images/           All uploaded property photos + logo
└── README.md
```

## Design system
- Colors, type, spacing all defined as CSS variables at the top of `style.css` — change the brand palette in one place.
- Fonts: Fraunces (display/serif) + Inter (body), loaded from Google Fonts.
- `.reveal` class + `main.js` IntersectionObserver = scroll-triggered fade-up animations site-wide.
- `prefers-reduced-motion` respected.

## Signature element
The homepage's "Four Moments" section (Nap / Yap / Play / Stay) is the site's visual signature — a scroll-tracked narrative built directly from your tagline.

## Not yet wired up (next steps)
- **Booking & Contact forms** currently show a front-end success state only — no email/backend is connected. Plug in a form service (e.g. Formspree) or your own backend endpoint when ready.
- **Reviews section** on the homepage is structurally ready but has placeholder cards — swap in real guest reviews (Airbnb/Google) when available.
- **Photos**: a few listing-style photos (utility corner, board games) were included for completeness in the gallery but kept out of hero/primary placements — see earlier photo critique. A light retouch/reshoot pass would strengthen the "premium" feel further.
- **Logo file**: currently using the uploaded logo JPG (has a cream background matching the site, so it blends acceptably) — a transparent PNG/SVG version would render more cleanly in the nav on scroll.

## Running locally
No build step — plain HTML/CSS/JS. Open `index.html` in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) for correct relative paths.

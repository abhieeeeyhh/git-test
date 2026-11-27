# VELOCE — Car Rental Landing Page

A modern, responsive landing page for a premium car rental brand. Built with plain HTML, CSS and JavaScript — no build step, no frameworks.

## Preview

Open `index.html` directly in a browser, or run a local server:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## What's included

- **Hero** with a glass booking bar, native date pickers and availability search
- **Fleet** of 8 cars with category filtering, rating, pricing and save-to-list
- **How it works** three-step section
- **Bento feature grid** with imagery and delivery details
- **Testimonials**, **FAQ accordion**, closing CTA and full footer
- **Fully responsive** from 320 px up, with a mobile navigation drawer
- **Car detail pages** — one page per car in `cars/`; the whole fleet card links to it
- **Standalone booking page** (`booking.html`) with validation → **success page** (`success.html`)
- **Careers page** (`careers.html`) with a job board — open roles with filtering by department
- **Accessibility**: keyboard focus states, skip link, semantic headings, labelled forms, live toast announcements and reduced-motion support
- **Lighthouse**: 100 Accessibility / 100 Best Practices / 100 SEO

## Structure

```
index.html      Markup and inline SVG icon sprite
styles.css      Design tokens, layout and responsive styles
app.js          Navigation, booking, filtering, favourites, reveals
cars/           Car detail page per car (8 total) + car.css
booking.html    Standalone booking page + booking.css
booking.js      Booking validation → redirects to success.html
success.html    Booking confirmation page + success.js
careers.html    Careers page + careers.css + careers.js (job listing + department filter)
assets/         Optimised local images
```

## Customising

- **Colors and type** — edit the tokens at the top of `styles.css` (`--accent`, `--paper`, `--ink`, `--surface`, etc.).
- **Fleet** — duplicate a `<article class="car-card" data-cat="...">` block in `index.html`. Categories must match the filter buttons (`sport`, `suv`, `electric`, `city`).
- **Booking flow** — `#booking-form` currently validates dates and shows a demo availability message. Connect the submit handler in `app.js` to your booking API or checkout URL.
- **Images** — all photos live in `assets/`. Replace them while keeping the same filenames to refresh the page instantly; every image has explicit dimensions and lazy loading.

## Notes

- Photography is from [Unsplash](https://unsplash.com) and is free to use under the Unsplash License.
- Font is Schibsted Grotesk via Google Fonts, with system fallbacks if offline.
- The brand, fleet, rates and contact details are fictional demo content.

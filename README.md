# Alex Makeover & Academy — Website

Full-stack site for Alex Makeover & Academy, Jhansi: five public pages (Home,
About, Services, Gallery, Contact/Booking), a booking system backed by a
real database, and a password-protected admin dashboard for managing
bookings and site settings, with email and WhatsApp confirmation built in.

**Want a live URL with no terminal use at all?** See `DEPLOY.md` — a
click-by-click guide to hosting this on Render for free/cheap straight from
a browser.

## What's real right now, and what needs setup

| Feature | Status |
|---|---|
| Multi-page site, nav, carousels, responsive design | Works immediately |
| Booking form → saved to database | Works immediately |
| Admin login (bcrypt password + sessions) | Works immediately — created automatically from ADMIN_EMAIL/ADMIN_PASSWORD the first time the server boots |
| Email notifications (new booking → you; confirmation → client) | Works once you add a Gmail address + App Password to `.env` |
| WhatsApp "chat with us" buttons | Work immediately, no setup — just `wa.me` links |
| WhatsApp **automated** confirmation on booking-confirm | Needs a Meta WhatsApp Business API account, a verified phone number, and an **approved message template** — that approval happens on Meta's side and can't be scripted around. Until then this step is safely skipped and logged. |

## 1. Install

Requires Node.js 18 or newer.

```bash
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Open `.env` and fill in:

- `SESSION_SECRET` — any long random string (the file tells you how to generate one).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the login you'll use for the studio dashboard. Use a real password, not the example one.
- `EMAIL_USER` / `EMAIL_PASS` — a Gmail address and a Gmail **App Password** (not your normal password). Create one at myaccount.google.com → Security → 2-Step Verification → App passwords.
- `ADMIN_NOTIFY_EMAILS` — already defaulted to the two addresses you gave (`ankitsriveas080@gmail.com`, `ashish.raman.iti@gmail.com`); change if needed.
- `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` — leave blank until you have a Meta WhatsApp Business API account. Everything else works fine without them.

## 3. Run it

```bash
npm start
```

Visit `http://localhost:3000`. Log in to the dashboard at
`http://localhost:3000/admin/login`.

## Deploying

This is a normal Node/Express app — it deploys to Render, Railway, a VPS,
etc. the same way any Express app does:

1. Push the code (everything except `.env`, `node_modules/`, and `data/*.db` — see `.gitignore`).
2. Set the same environment variables from `.env` in your host's dashboard.
3. Run `npm install && npm start` — the admin account is created/updated automatically at boot from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, no separate seed step needed.
4. Set `cookie.secure: true` in `server.js`'s session config once the site is served over HTTPS (it's commented in as a reminder).

**Database note:** this uses SQLite (a single file at `data/app.db`) rather
than Postgres/MongoDB — it needs no separate database server, which keeps
setup to one command, and is genuinely fine for a single-location business's
booking volume. If you outgrow it later, the SQL in `utils/db.js` is close
enough to standard Postgres syntax that migrating is a small job, not a
rewrite.

## Fixing the Facebook link

I couldn't verify a real Facebook profile URL for "Ankit Srivas — Alex
Celebrity Makeup Artist" — there's no reliable way to confirm a name maps to
the right profile without you confirming it. Until you fix it, the Facebook
icon points to a Facebook search for that name rather than guessing (and
possibly linking to a stranger's profile). To fix it:

1. Log in at `/admin/login`.
2. Go to **Site settings** at the bottom of the dashboard.
3. Paste your real Facebook page/profile URL into the "Facebook URL" field and save — it updates everywhere (footer + floating button) immediately.

The same panel also controls the Instagram link, WhatsApp number, displayed
phone number, contact email, address, and an optional announcement banner
that appears at the top of every page when set.

## Project structure

```
server.js               Express app, sessions, page + API routing
routes/auth.js           Login / logout / session check
routes/bookings.js       Create booking (public), list/confirm/delete (admin only)
routes/settings.js       Read/update site-wide settings (admin only)
utils/db.js              SQLite connection + schema
utils/mailer.js          Nodemailer (Gmail SMTP) email sending
utils/whatsapp.js        WhatsApp Cloud API integration (optional)
utils/settings.js        DB-backed site settings with first-run defaults
middleware/requireAuth.js  Session-based route protection
scripts/seed-admin.js    Manual/local alternative to the automatic boot-time admin setup
views/                   EJS templates (one file per page) + shared partials
public/css/style.css     All styling
public/js/               Carousel engine, nav toggle, form handlers
public/images/           Photos used across the site
```

## Known limitations, stated plainly

- Sessions use Express's in-memory store — fine for one server instance; if
  you ever run multiple instances behind a load balancer, swap in a shared
  session store (e.g. `connect-sqlite3` or Redis) or logins won't persist
  across instances.
- There's no "forgot password" flow — reset by changing `ADMIN_PASSWORD` in
  your environment variables and restarting/redeploying; the app updates the
  stored password automatically the next time it boots.
- Login attempts are rate-limited in memory per IP (resets on restart) —
  adequate for a small site, not a substitute for a WAF if this ever gets
  targeted seriously.

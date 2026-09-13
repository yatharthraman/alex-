require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { requireAuthPage } = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const settingsRoutes = require('./routes/settings');
const { getAllSettings } = require('./utils/siteSettings');
const { ensureAdmin } = require('./utils/ensureAdmin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.SESSION_SECRET) {
  console.warn('[server] SESSION_SECRET is not set in .env — using an insecure default. Set this before deploying.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'insecure-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    // secure: true, // uncomment once the site is served over HTTPS
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
}));

// Site-wide values available to every template. Pulled from the settings
// table (editable in /admin/dashboard) with .env values as first-run fallback.
app.use((req, res, next) => {
  const s = getAllSettings();
  res.locals.site = {
    businessPhoneDisplay: s.business_phone_display,
    businessWhatsappNumber: s.whatsapp_number,
    address: s.address,
    facebookUrl: s.facebook_url,
    instagramUrl: s.instagram_url,
    contactEmail: s.contact_email,
    announcement: s.announcement
  };
  next();
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

// ---------- Public pages ----------
app.get('/', (req, res) => res.render('home', { active: 'home' }));
app.get('/about', (req, res) => res.render('about', { active: 'about' }));
app.get('/services', (req, res) => res.render('services', { active: 'services' }));
app.get('/gallery', (req, res) => res.render('gallery', { active: 'gallery' }));
app.get('/portfolio', (req, res) => res.redirect(301, '/gallery')); // old link, kept working
app.get('/contact', (req, res) => res.render('contact', { active: 'contact' }));

// ---------- Admin pages ----------
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminId) return res.redirect('/admin/dashboard');
  res.render('admin-login', { active: 'admin' });
});
app.get('/admin/dashboard', requireAuthPage, (req, res) => {
  res.render('admin-dashboard', { active: 'admin', adminEmail: req.session.adminEmail });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404', { active: '' });
});

app.listen(PORT, () => {
  console.log(`Alex Makeover site running at http://localhost:${PORT}`);
});

// Create/update the admin account from ADMIN_EMAIL / ADMIN_PASSWORD at boot.
// Means a hosted deploy needs no manual "seed" step at all — just set those
// two env vars in the platform's dashboard and deploy.
ensureAdmin().catch(err => console.error('[server] ensureAdmin failed:', err));

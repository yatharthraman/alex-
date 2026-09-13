# Deploying this with zero terminal use

Everything below happens in a web browser — no command line, no local Node
install, nothing to run on your own machine.

## Why you still need to do a couple of clicks yourself

I can't create accounts, push code, or click "Deploy" on your behalf — I
have no network access from where I run, so I genuinely cannot reach GitHub
or Render's servers myself. What I *can* do is hand you code that's ready
to deploy as-is, and tell you exactly which buttons to click. The steps
below are the shortest real path from "code" to "live URL" — about 10
minutes, all point-and-click.

## Step 1 — Put the code on GitHub (~3 minutes)

1. Go to [github.com](https://github.com) and sign in (or create a free account).
2. Click the **+** in the top right → **New repository**. Name it anything (e.g. `alex-makeover-site`). Keep it **Private** if you'd rather it not be public. Click **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Unzip the project folder I gave you (double-click it — this is a normal file-explorer action, not a terminal command), then drag the whole extracted folder onto that GitHub upload page. GitHub will preserve the folder structure.
5. Scroll down and click **Commit changes**.

## Step 2 — Deploy on Render (~5 minutes)

1. Go to [render.com](https://render.com) and sign up free (no credit card needed to sign up).
2. Click **New** → **Blueprint**.
3. Connect your GitHub account and select the repo you just created. Render will read the `render.yaml` file already included in the project and set up the service automatically.
4. Render will prompt you for the env vars marked "sync: false" in that file. Enter:
   - `ADMIN_EMAIL` → `alexmakeup@gmail.com`
   - `ADMIN_PASSWORD` → `89576176` *(see the security note below before you commit to this one)*
   - `EMAIL_USER` → your Gmail address (for sending real booking emails)
   - `EMAIL_PASS` → a Gmail **App Password**, not your normal Gmail password — generate one at myaccount.google.com → Security → 2-Step Verification → App passwords
   - `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` → leave blank unless you already have a Meta WhatsApp Business API account
5. Click **Apply** / **Deploy**. Render builds and starts the app — takes a couple of minutes.
6. You'll get a live URL like `https://alex-makeover.onrender.com`. That's it — share that link.

No `npm run seed` step needed: the app creates the admin account from
`ADMIN_EMAIL`/`ADMIN_PASSWORD` automatically the first time it boots.

## About the password you asked to set

`89576176` is 8 digits, all numbers — the kind of password a brute-force
script gets through quickly, and the admin dashboard sees real customer
names, phone numbers, and emails once bookings start coming in. I've set it
up as you asked (that's your call to make), but if you want to swap it
later: change `ADMIN_PASSWORD` in Render's dashboard under your service →
**Environment**, save, and Render redeploys — the app updates the stored
password automatically on that next boot, no other steps needed.

## The free-tier trade-off, stated plainly

If you use `plan: free` instead of `starter` in `render.yaml` (delete the
`disk:` block too, since free tier doesn't support persistent disks):

- It costs nothing.
- The service goes to sleep after 15 minutes with no visitors, and takes
  about a minute to wake back up on the next visit — fine for a small
  business site, mildly annoying if someone lands right as it's asleep.
- **The database resets on every redeploy and periodically on restart** —
  meaning booking requests, your admin login, and any site settings you've
  changed can vanish without warning. That's a real risk for something
  meant to actually take client bookings.

The `starter` plan + 1GB disk in the included `render.yaml` (roughly
$7.25/month total) avoids that data-loss risk. I'd recommend paying for it
once real bookings start coming in, even if you start on free to try
things out first.

## Custom domain

Once deployed, Render lets you attach a domain you already own (e.g.
`alexmakeover.in`) for free under your service's **Settings → Custom
Domains** — just point your domain's DNS at Render as instructed there.

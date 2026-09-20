# Postbird

Postbird is a small email dashboard I built for sending emails using SMTP. It also keeps the history of sent emails and tracks if the email was opened or if someone clicked a link.

Basically, you can create an account, add your SMTP details (Gmail, Yahoo, Microsoft 365, or custom SMTP), write an email, add attachments if needed, and send it.

The React frontend does not directly connect with Gmail or any other mail server. It only communicates with my API. The API handles the SMTP connection using Nodemailer, stores the data using Prisma, and handles open/click tracking.

I didn't try to make this a Gmail clone because SMTP is mainly for sending emails and cannot receive them. Inbox syncing is optional and can be done using IMAP.

---

## What you can do

- Create an account and login
- Add SMTP configuration and test it before sending
- Send emails with To, CC and BCC
- Upload files and attach them to emails
- See sent email history
- Check if tracking events were received
- Enable or disable open tracking
- Enable or disable click tracking

For attachments, I currently support PDF, PNG, JPG, GIF, WEBP, CSV, Word and Excel files, with a maximum size of 25MB.

SMTP passwords are encrypted using AES-256-GCM. The password is never returned to the frontend. Users can only access their own SMTP configurations, emails and files.

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn-style components

### Backend

- Node.js
- Express
- TypeScript
- Zod
- JWT
- Helmet
- CORS
- Rate limiting

### Database

- PostgreSQL
- Prisma

### Email

- Nodemailer for sending emails
- ImapFlow for optional inbox syncing

### Project structure

```text
apps/web          → React dashboard (Vite, port 5173)
apps/api          → Express API + Prisma (port 4000)
packages/shared   → Shared Zod schemas and SMTP presets
```

During development, Vite proxies `/api` requests to the API running on `http://localhost:4000`.

---

## API Structure

I followed a simple flow for the API:

```text
Route → Middleware → Zod → Controller → Service → Prisma / Nodemailer
```

I tried to keep the controllers simple and keep the actual logic inside services.

For example, SMTP-related logic, password encryption, tracking and file handling are handled in services instead of putting everything inside the controller.

The shared validation is inside `packages/shared`, so the frontend form and backend are using the same validation structure.

---

## Setup

You need:

- Node.js 20+
- npm
- PostgreSQL

Docker is optional. If you already have PostgreSQL running on port `5432`, you don't need Docker.

First copy the environment file:

```bash
cp .env.example .env
```

Then configure the required variables:

| Variable         | Used for                    |
| ---------------- | --------------------------- |
| `DATABASE_URL`   | PostgreSQL connection       |
| `JWT_SECRET`     | Signing login tokens        |
| `ENCRYPTION_KEY` | Encrypting SMTP passwords   |
| `API_URL`        | URL used for tracking links |
| `FRONTEND_URL`   | CORS and redirects          |

`JWT_SECRET` and `ENCRYPTION_KEY` should be at least 32 characters.

The `SMTP_*` variables in `.env` are only used by the seed script to create an initial Gmail SMTP configuration. You should not commit your `.env` file.

Then install everything and setup the database:

```bash
npm install

npm run db:generate

docker compose up -d postgres
```

If PostgreSQL is already running, you can skip the Docker command.

Run the Prisma migration:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Then run the seed:

```bash
npm run db:seed
```

Start the API and frontend in two terminals:

```bash
npm run dev:api
```

API:

```text
http://localhost:4000
```

And:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The seed creates a demo account:

```text
Email: demo@postbird.local
Password: change-me-before-use
```

If you keep the seed account, change the password before using it.

---

## Gmail SMTP Setup

Gmail does not allow you to use your normal Gmail password for SMTP.

You need to enable 2-Step Verification on your Google account and then create an App Password.

For Gmail, the SMTP configuration is:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURITY=STARTTLS
```

In the Postbird UI, you can select the Gmail preset. The host, port and security settings are filled automatically.

You only need to enter your Gmail address and the Gmail App Password, then test the connection.

One thing that confused me while testing this was `smtpConfigurationId`.

This ID does **not** come from Gmail.

It is the ID of the SMTP configuration that was saved in Postbird's own database. So after creating a Gmail SMTP configuration, the saved database row has its own UUID, and that UUID is what the send API expects.

Yahoo and Microsoft 365 work in a similar way using their respective presets. The Custom option can be used if you want to connect another SMTP provider.

---

## Attachments

Attachments are treated as a separate file library for each account.

You can upload files from the attachment section or directly while composing an email.

When sending an email, the frontend sends the `attachmentIds`.

The API then finds those files from the user's stored files and passes them to Nodemailer.

Supported file types:

```text
pdf
png
jpg
jpeg
gif
webp
txt
csv
doc
docx
xls
xlsx
```

The maximum attachment size is 25MB.

---

## Open and Click Tracking

For open tracking, I add a small `1×1` image to the email HTML.

The image points to:

```text
GET {API_URL}/api/tracking/open/:trackingId
```

When the email client requests that URL, Postbird records the tracking event.

So the dashboard does not just assume that an email was opened. It only records an open when the tracking URL is actually requested.

For example, if the API is running locally:

```text
http://localhost:4000
```

Gmail cannot access that URL from the internet. Because of this, open tracking will normally stay at `0%` when testing locally.

To test real tracking, the API needs to be publicly accessible. You can use something like:

- ngrok
- Cloudflare Tunnel
- A deployed server

Then set:

```env
API_URL=https://your-public-api-url.com
```

Restart the API and send a new email.

Old emails will still contain the old tracking URL, so changing `API_URL` does not change tracking links in emails that were already sent.

For click tracking, links containing `http` or `https` are rewritten to go through the API first. When someone clicks the link, the API records the event and then redirects them to the original URL.

The same public URL requirement applies to click tracking.

The tracking numbers are also not guaranteed to be 100% accurate. Some email clients don't load images, and some email providers cache or proxy tracking requests.

---

## Things I intentionally did not add

I kept some things out of this project to keep the scope smaller:

- Gmail OAuth — using App Passwords instead
- Swagger / API documentation UI
- Advanced analytics and fancy charts
- HTTP-only cookies — JWT is stored in `localStorage` for this project
- Automatic IMAP password storage
- Full Gmail-style inbox

IMAP support is optional, so inbox syncing would need to be configured separately.

# Team Step Tracker

A full-stack web app to track daily steps for your team. Includes a live leaderboard, step logging, trend charts, and an API endpoint compatible with Apple Shortcuts so team members can log steps directly from their iPhone.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite via `better-sqlite3`
- **Charts:** Chart.js + react-chartjs-2

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
cd team-step-tracker
npm run install:all
```

### 2. Configure environment (optional)

```bash
cp .env.example server/.env
```

Edit `server/.env` if you want to set a bearer token for the iOS Shortcut endpoint:

```
PORT=3001
API_TOKEN=your-secret-token-here
```

Leave `API_TOKEN` empty to skip token auth during local development.

### 3. Start both servers

```bash
npm run dev
```

This starts:
- **Express API** on `http://localhost:3001`
- **React dev server** on `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

The database (`server/data.db`) is created automatically on first run and seeded with 5 sample members and 7 days of random step data.

---

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Team leaderboard ranked by weekly steps, plus three metric cards |
| **Log Steps** | Form to log steps for any member + recent history table |
| **Trends** | Line chart (daily steps per member) and horizontal bar chart (weekly totals) |
| **Settings** | Add / remove team members |

---

## API Reference

### Members

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/members` | — | List all members |
| `POST` | `/api/members` | `{ name }` | Add a new member |
| `DELETE` | `/api/members/:id` | — | Remove a member (and their steps) |

### Steps

| Method | Endpoint | Query / Body | Description |
|--------|----------|--------------|-------------|
| `GET` | `/api/steps` | `?member_id=&from=YYYY-MM-DD&to=YYYY-MM-DD` | Query step entries |
| `POST` | `/api/steps` | `{ member_id, date, steps, token? }` | Log or update steps |

Posting to an existing `(member_id, date)` pair **updates** the entry rather than creating a duplicate.

---

## iOS Shortcut Setup

Team members can log their steps directly from iPhone using the Apple Shortcuts app — no app install needed.

### Step 1 — Set your API token (server admin)

In `server/.env`, set a strong token:

```
API_TOKEN=myteam-secret-abc123
```

Restart the server. All Shortcut requests must include this token.

### Step 2 — Find your member ID

Open `http://localhost:3001/api/members` (or your deployed URL) and note the `id` of the team member.

### Step 3 — Create the Shortcut

1. Open the **Shortcuts** app on iPhone.
2. Tap **+** to create a new shortcut.
3. Add action: **Get Contents of URL**
4. Configure:
   - **URL:** `https://your-server.example.com/api/steps`
     *(Replace with your deployed server URL. For local testing use your machine's LAN IP, e.g. `http://192.168.1.10:3001/api/steps`)*
   - **Method:** `POST`
   - **Headers:** `Content-Type: application/json`
   - **Request Body:** `JSON`
     ```json
     {
       "member_id": 1,
       "date": "<today's date in YYYY-MM-DD>",
       "steps": 8500,
       "token": "myteam-secret-abc123"
     }
     ```
5. To make the date dynamic, use the **Format Date** action before the URL step and set format to `yyyy-MM-dd`.
6. To make steps dynamic, use an **Ask for Input** action (Number type) before the URL step and reference its result in the `steps` field.

### Step 4 — Run it

Tap the shortcut (or add it to your Home Screen). The app will record or update your steps for today.

### Automation tip

Add the shortcut to an **Automation** that triggers every evening (e.g. 9 PM) to remind you to log steps, optionally reading from the Health app's step count using the **Find Health Samples** action.

---

## Project Structure

```
team-step-tracker/
├── package.json          # root — runs both servers via concurrently
├── .env.example
├── README.md
├── server/
│   ├── package.json
│   ├── index.js          # Express app entry point
│   ├── db.js             # SQLite setup + seed
│   └── routes/
│       ├── members.js
│       └── steps.js
└── client/
    ├── package.json
    ├── vite.config.js    # proxies /api → localhost:3001
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Nav.jsx
        │   └── Nav.css
        └── pages/
            ├── Dashboard.jsx / .css
            ├── LogSteps.jsx  / .css
            ├── Trends.jsx    / .css
            └── Settings.jsx  / .css
```

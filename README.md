# 🚀 MHPISSJ - Hybrid Cloud Production App

Ye ek high-performance Full-stack application hai jo **Supabase** aur **Next.js** par bani hai. Is project ki khasiyat ye hai ke iska Database ek physical server (Laptop) par host ho raha hai, jabke Frontend Vercel par hai.

## 🛠 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (Hosted on Vercel)
- **Backend/Database:** [Supabase Self-Hosted](https://supabase.com/docs/guides/self-hosting) (Running on Ubuntu Server)
- **Networking:** [Cloudflare Tunnels](https://www.cloudflare.com/products/tunnel/) (For secure local-to-cloud bridge)
- **Backup:** [Snapper](https://opensuse.github.io/snapper/) (Snapshot-based local backups)

## 🏗 System Architecture

Is app ka architecture "Hybrid" hai:
1. **Ubuntu Server (Home Laptop):** Yahan Docker ke zariye Supabase chal raha hai.
2. **Cloudflare Tunnel:** Ye ghar ke internet aur Vercel ke darmiyan ek encrypted rasta (bridge) banata hai taaki Port Forwarding ki zaroorat na pare.
3. **Vercel:** Frontend yahan se load hota hai aur Cloudflare Tunnel ke zariye database se data mangta hai.

## ⚙️ Performance Optimizations

Server ko fast rakhne ke liye humne ye steps liye hain:
- **Snapper Tuning:** Snapshots ko `hourly` se badal kar `daily` (18:00 UTC) par set kiya gaya hai taaki CPU/RAM par bojh kam ho.
- **Database Indexing:** Queries ko fast karne ke liye key columns par indexes lagaye gaye hain.
- **Connection Pooling:** Vercel se database connections ko manage karne ke liye pooler use kiya gaya hai.

## 🚀 Local Development & Deployment

### 1. Requirements
- Node.js (Latest)
- Cloudflared (For tunnel connection)
- Docker (For Supabase local instance)

### 2. Environment Variables
Project ko chalane ke liye `.env` file mein ye variables zaroori hain:

```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-cloudflare-tunnel-link.trycloudflare.com](https://your-cloudflare-tunnel-link.trycloudflare.com)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

```

### 3. Running the App

```bash
npm install
npm run dev

```

## 🛡 Security & Maintenance

* **Snapshots:** Daily snapshots for data safety using Snapper.
* **Tunnels:** No open ports on the local router; all traffic is routed through Cloudflare's secure edge.
* **Database:** Self-hosted Supabase instance on a dedicated Ubuntu environment.

---
## Built with ❤️ by [Raja Babar](https://www.google.com/search?q=https://github.com/Raja-Babar)

```
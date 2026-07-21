# 🌱 SIBOL

**An IoT-powered smart gardening platform** that connects ESP32 sensor nodes, AI-based crop health detection, and a real-time web dashboard — built for community and barangay/city hall gardening programs.

SIBOL monitors soil and environmental conditions in real time, automates irrigation, detects crop pests/diseases from images using a YOLO model, and keeps growers informed through live notifications, SMS, and email alerts.

---

## ✨ Features

- **Real-time sensor monitoring** — soil moisture, and other environmental readings streamed from ESP32 nodes over MQTT and pushed live to the dashboard via WebSockets (Laravel Reverb / Pusher).
- **Smart irrigation** — automated and manual irrigation control tied to live sensor data.
- **AI crop health detection** — a YOLO11 (Ultralytics) computer vision model, served by a standalone Flask microservice, detects crop pests/diseases from uploaded or captured images.
- **Crop care management** — per-garden crop profiles, care configurations, and health tracking.
- **Notifications** — real-time in-app alerts, plus SMS (Twilio / Infobip) and email notifications for critical events (e.g. low soil moisture, detected crop issues).
- **Reports** — daily and monthly garden reports, exportable as PDF (DomPDF).
- **Admin & user roles** — separate admin and user dashboards, account settings, and activity logging (Spatie Activitylog) for auditability.
- **Authentication** — standard login/register plus social login (Laravel Socialite) and API auth via Sanctum.
- **Media storage** — garden/crop images and detection snapshots stored via Cloudinary.

## 🏗️ Architecture

SIBOL is split into three services:

| Service | Stack | Responsibility |
|---|---|---|
| **Backend** (`/app`, `/routes`, `/database`, etc.) | Laravel 12 (PHP 8.2) | REST API, auth, MQTT ingestion, WebSocket broadcasting, notifications, reports |
| **Frontend** (`/sibol-frontend`) | React + Vite + Tailwind CSS 4 | User & admin dashboards, live sensor charts, crop care UI |
| **Detection service** (`/python-yolo`) | Flask + Ultralytics YOLO11 + OpenCV | Image-based crop pest/disease detection, served as a separate API |

ESP32 sensor nodes publish readings over **MQTT**, which the Laravel backend consumes (`php-mqtt/laravel-client`) and stores, then broadcasts to the frontend in real time over WebSockets (Laravel Reverb / Pusher + Laravel Echo).

## 🧰 Tech Stack

**Backend:** Laravel 12, PHP 8.2+, Laravel Sanctum, Laravel Socialite, Laravel Reverb, Spatie Activitylog, DomPDF, Twilio SDK, php-mqtt/laravel-client, Cloudinary

**Frontend:** React, Vite, Tailwind CSS 4, Axios, MQTT.js, Laravel Echo, Pusher JS

**AI/Detection service:** Python, Flask, Ultralytics YOLO11, OpenCV, PyTorch (CPU), Cloudinary

**Infra:** Docker, Nixpacks, Procfile (Railway/Render-style deployment)

## 📁 Project Structure

```
SIBOL-WEB/
├── app/                    # Laravel application code (Controllers, Models, Events, Services)
├── routes/                 # api.php, web.php, channels.php
├── database/                # Migrations, seeders, factories
├── config/                  # Laravel config (mail, broadcasting, cors, cloudinary, etc.)
├── docker/                  # nginx config, container start script
├── python-yolo/             # Flask + YOLO11 crop detection microservice
│   ├── app.py
│   ├── models/               # Trained .pt model weights
│   └── requirements.txt
├── sibol-frontend/          # React + Vite dashboard
│   └── src/
│       ├── Views/             # Login, Register, Dashboards, Crop Care, Reports, etc.
│       ├── components/        # Layouts (Admin, Guest, User)
│       └── hooks/             # useSensorData, etc.
├── dockerfile
├── nixpacks.toml
├── Procfile
└── composer.json / package.json
```

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- Python 3.10+ (for the detection service)
- A database (SQLite by default, MySQL/PostgreSQL supported)
- An MQTT broker (for ESP32 sensor data)

### 1. Backend (Laravel)

```bash
git clone https://github.com/Jherald-Vibar/SIBOL-WEB.git
cd SIBOL-WEB

composer install
cp .env.example .env
php artisan key:generate

# configure DB, MQTT broker, Cloudinary, Twilio/Infobip, Pusher/Reverb in .env

php artisan migrate --seed
php artisan serve
```

To run the queue worker, log watcher, and Vite dev server alongside the app in one command:

```bash
composer run dev
```

### 2. Frontend (React)

```bash
cd sibol-frontend
npm install
npm run dev
```

### 3. Detection service (Python/YOLO)

```bash
cd python-yolo
pip install -r requirements.txt
python app.py
```

### Environment Variables

Key variables to set in `.env` (see `.env.example` for the full list):

- `DB_*` — database connection
- `BROADCAST_CONNECTION`, `REVERB_*` / `PUSHER_*` — real-time broadcasting
- `MQTT_*` — broker host/credentials for ESP32 sensor ingestion
- `CLOUDINARY_*` — media storage
- `TWILIO_*` / Infobip credentials — SMS notifications
- `MAIL_*` — email notifications

## 🌾 Data Model Overview

- **Garden** — a monitored garden/plot
- **Crop** / **CropProfile** — crops planted and their care profiles (ideal moisture range, watering schedule, etc.)
- **Esp** — registered ESP32 sensor devices
- **SensorData** — time-series sensor readings
- **DetectionResults** — YOLO detection outputs (pest/disease findings)
- **Notification** — in-app/SMS/email alerts
- **User** / **Admin** — accounts and roles

## 📦 Deployment

The repo includes a `dockerfile`, `docker/nginx.conf`, `docker/start.sh`, `nixpacks.toml`, and `Procfile`, ready for containerized deployment (e.g. Railway, Render, or any Docker host). The Python detection service is deployed as a separate container/process from the Laravel app.

## 📄 License

No license has been specified for this repository yet. All rights reserved by the author unless a license is added.

## 👤 Author

**Jherald D. Vibar**
[GitHub](https://github.com/Jherald-Vibar)

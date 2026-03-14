# LiveStream Server - Setup Guide

## Instalasi & Menjalankan di UserLAnd (Android)

### 1. Pasang dependensi
```bash
cd /server
npm install
```

### 2. Jalankan server
```bash
node server.js
```
Server berjalan di: `http://localhost:8226`

### 3. Expose via Ngrok (HTTPS wajib untuk getUserMedia)
```bash
ngrok http 8226
```
Copy URL Ngrok Anda, misalnya: `https://xxxx.ngrok.io`

---

## Akses Halaman

| Halaman | URL |
|---------|-----|
| Host (Siaran) | `https://xxxx.ngrok.io/host.html` |
| Penonton | `https://xxxx.ngrok.io/watch.html` |

---

## Struktur Folder

```
server/
├── server.js          ← Signaling server (Express + Socket.io)
├── package.json
├── README.md
└── public/
    ├── host.html      ← Halaman untuk host/streamer
    └── watch.html     ← Halaman untuk penonton (lobby + tonton)
```

---

## Fitur

- ✅ WebRTC P2P streaming dengan 4 STUN servers
- ✅ Trickle ICE untuk koneksi stabil di jaringan seluler
- ✅ Auto-reconnect jika peer error (3 percobaan)
- ✅ Live chat dua arah (Emas=Host, Biru=Penonton)
- ✅ Lobby scroll daftar siaran aktif
- ✅ Tombol overlay "Aktifkan Suara" untuk kebijakan autoplay browser
- ✅ Tampilan portrait mobile-first
- ✅ Auto-deteksi URL (tidak perlu hardcode URL Ngrok)

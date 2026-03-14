import { useState, useEffect, useRef } from "react";

interface Stream {
  streamId: string;
  title: string;
  startedAt: string;
  viewerCount: number;
}

const MOCK_STREAMS: Stream[] = [
  { streamId: "demo_001", title: "🎮 Gaming Seru Bareng!", startedAt: new Date().toISOString(), viewerCount: 142 },
  { streamId: "demo_002", title: "🎵 Live Music Session", startedAt: new Date().toISOString(), viewerCount: 87 },
  { streamId: "demo_003", title: "💬 Ngobrol Santai Malem Minggu", startedAt: new Date().toISOString(), viewerCount: 234 },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"lobby" | "host-info">("lobby");
  const [streams] = useState<Stream[]>(MOCK_STREAMS);
  const [copied, setCopied] = useState(false);
  const serverUrl = window.location.origin;

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}d lalu`;
    return `${Math.floor(diff / 60)}m lalu`;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#0a0a0f", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* Header */}
      <div className="w-full max-w-sm px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FFD700" }}>📡 LiveStream</h1>
          <span
            style={{
              background: "#FF3B3B",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 6,
              letterSpacing: 1,
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          >
            LIVE
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#666" }}>Platform streaming WebRTC real-time</p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-sm px-4 mb-4">
        <div
          style={{ display: "flex", background: "#1a1a2e", borderRadius: 12, padding: 4 }}
        >
          {["lobby", "host-info"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: "none",
                background: activeTab === tab ? "#FFD700" : "transparent",
                color: activeTab === tab ? "#000" : "#888",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab === "lobby" ? "🎬 Siaran Live" : "🎥 Mulai Siaran"}
            </button>
          ))}
        </div>
      </div>

      {/* Lobby Tab */}
      {activeTab === "lobby" && (
        <div className="w-full max-w-sm px-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 12, color: "#555" }}>
            Ini adalah preview UI. Untuk siaran nyata, akses via server Anda.
          </p>

          {streams.map((s) => (
            <div
              key={s.streamId}
              style={{
                background: "#1a1a2e",
                border: "1px solid #2a2a3e",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "linear-gradient(135deg, #FFD700, #FF8C00)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  🎥
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 8 }}>
                    <span style={{ color: "#FF3B3B", fontWeight: 600 }}>● LIVE</span>
                    <span>👁 {s.viewerCount} penonton</span>
                  </div>
                </div>
              </div>
              <button
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FF8C00)",
                  border: "none",
                  borderRadius: 24,
                  color: "#000",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 16px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Tonton
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Host Info Tab */}
      {activeTab === "host-info" && (
        <div className="w-full max-w-sm px-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #2a2a3e",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFD700", marginBottom: 12 }}>
              ⚙️ Setup Server
            </h2>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>
              Aplikasi ini membutuhkan <strong style={{ color: "#fff" }}>server Node.js</strong> yang berjalan secara terpisah.
              File server tersedia di folder <code style={{ color: "#FFD700", background: "#0a0a0f", padding: "2px 6px", borderRadius: 4 }}>/server</code>.
            </p>
          </div>

          {[
            { step: "1", label: "Install dependensi", code: "cd server && npm install" },
            { step: "2", label: "Jalankan server", code: "node server.js" },
            { step: "3", label: "Expose via Ngrok", code: "ngrok http 8226" },
          ].map(({ step, label, code }) => (
            <div
              key={step}
              style={{ background: "#1a1a2e", borderRadius: 12, padding: 16, border: "1px solid #2a2a3e" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#FFD700",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {step}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{label}</span>
              </div>
              <div
                style={{
                  background: "#0a0a0f",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#7ec8e3",
                  wordBreak: "break-all",
                }}
              >
                {code}
              </div>
            </div>
          ))}

          <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 16, border: "1px solid #2a2a3e" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#aaa", marginBottom: 12 }}>Setelah server berjalan:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "🎥 Halaman Host", path: "/host.html" },
                { label: "👁 Halaman Penonton", path: "/watch.html" },
              ].map(({ label, path }) => (
                <div
                  key={path}
                  style={{
                    background: "#0a0a0f",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#ccc" }}>
                    {label}: <code style={{ color: "#FFD700" }}>ngrok-url{path}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 59, 59, 0.1)",
              border: "1px solid rgba(255, 59, 59, 0.3)",
              borderRadius: 12,
              padding: 14,
              fontSize: 12,
              color: "#ff9a9a",
              lineHeight: 1.7,
            }}
          >
            ⚠️ <strong>Penting:</strong> getUserMedia (akses kamera) hanya bekerja di HTTPS. Pastikan Anda menggunakan URL Ngrok (bukan localhost) saat mengakses dari perangkat lain.
          </div>
        </div>
      )}

      {/* Bottom padding */}
      <div style={{ height: 40 }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Index;

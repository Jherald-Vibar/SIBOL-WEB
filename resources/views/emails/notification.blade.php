<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background: #f7f4ee; font-family: 'DM Sans', sans-serif; }
    .wrap { max-width: 600px; margin: 32px auto; padding: 0 16px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid rgba(11,61,30,0.08); }
    .header { background: linear-gradient(135deg, rgba(26,102,54,0.95) 0%, rgba(11,61,30,0.98) 100%); padding: 36px 32px 28px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(168,197,160,0.25); background: rgba(46,139,87,0.18); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(168,197,160,0.9); margin-bottom: 14px; }
    .pulse { width: 5px; height: 5px; border-radius: 50%; background: #a8c5a0; display: inline-block; }
    .playfair { font-family: 'Playfair Display', serif; }
    .header-title { font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 6px; line-height: 1.2; }
    .header-sub { font-size: 13px; color: rgba(255, 255, 255, 0.991); margin: 0; }
    .body { padding: 28px 32px; }
    .notif-card { background: rgba(46,139,87,0.05); border-left: 3px solid #2e8b57; border-radius: 0 14px 14px 0; padding: 16px 18px; margin-bottom: 14px; }
    .notif-type { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #2e8b57; margin-bottom: 6px; }
    .notif-title { font-size: 15px; font-weight: 700; color: #0b3d1e; margin: 0 0 5px; }
    .notif-msg { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
    .notif-time { font-size: 11px; color: #9ca3af; margin-top: 8px; }
    .divider { border: none; border-top: 1px solid rgba(11,61,30,0.07); margin: 20px 0; }
    .btn { display: inline-block; background: #d4840a; color: #ffffff; padding: 11px 24px; border-radius: 999px; font-size: 13px; font-weight: 600; text-decoration: none; margin-top: 4px; }
    .footer { background: #f7f4ee; padding: 18px 32px; text-align: center; }
    .brand { font-size: 13px; font-weight: 700; color: #0b3d1e; margin-bottom: 6px; }
    .footer-text { font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">

      {{-- Header --}}
      <div class="header">
        <div class="pill">
          <span class="pulse"></span> New Notification
        </div>
        <div class="playfair header-title">
          You have a new <em style="color:#f0a830;">alert</em>
        </div>
        <p class="header-sub">Your farm monitoring system detected something that needs attention.</p>
      </div>

      {{-- Body --}}
      <div class="body">
        <div class="notif-card">
          <div class="notif-type">{{ $notification['type'] ?? 'System Alert' }}</div>
          <p class="notif-title">{{ $notification['title'] ?? 'New Notification' }}</p>
          <p class="notif-msg">{{ $notification['message'] ?? '' }}</p>
          <div class="notif-time">
            {{ isset($notification['created_at']) ? \Carbon\Carbon::parse($notification['created_at'])->format('F j, Y — g:i A') : now()->format('F j, Y — g:i A') }}
          </div>
        </div>

        <hr class="divider">

        <p style="font-size:13px; color:#6b7280; line-height:1.6; margin:0 0 18px;">
          Visit your dashboard to view live sensor data and take action on this notification.
        </p>
        <a href="https://sibol-frontend.onrender.com/user/dashboard" class="btn">View Dashboard →</a>
      </div>

      {{-- Footer --}}
      <div class="footer">
        <div class="brand">🌿 SIBOL</div>
        <p class="footer-text">
          You're receiving this because notifications are enabled for your account.<br>
          © {{ date('Y') }} SIBOL. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>

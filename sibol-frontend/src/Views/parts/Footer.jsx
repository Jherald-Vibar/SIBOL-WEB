import React from 'react'

const Footer = () => {
  return (
    <footer style={{ fontFamily: "'DM Sans', sans-serif", background: '#061a0d', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .footer-orb {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.08) 0%, transparent 70%);
          right: -100px; top: -100px;
          pointer-events: none;
        }
        .footer-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: 72px 48px 0;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .footer-brand-wordmark {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700;
          color: #fff; letter-spacing: 3px;
          margin-bottom: 14px; display: block;
        }
        .footer-brand-desc {
          font-size: 13px; line-height: 1.8;
          color: rgba(255,255,255,0.38);
          max-width: 240px; margin-bottom: 28px;
        }
        .footer-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px;
          border: 1px solid rgba(212,132,10,0.3);
          border-radius: 100px;
          font-size: 11px; letter-spacing: 1.2px;
          text-transform: uppercase; color: #d4840a;
        }
        .footer-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #d4840a;
          animation: fpulse 1.8s ease-in-out infinite;
        }
        @keyframes fpulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.4; transform:scale(1.5); }
        }
        .footer-col-title {
          font-size: 10px; font-weight: 500; letter-spacing: 2.5px;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
          margin-bottom: 22px;
        }
        .footer-links {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 13px;
        }
        .footer-links li a {
          font-size: 14px; color: rgba(255,255,255,0.58);
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .footer-links li a:hover { color: #fff; }
        .footer-links li a::before {
          content: '';
          display: inline-block;
          width: 0; height: 1px;
          background: #d4840a;
          transition: width 0.25s ease;
          vertical-align: middle;
        }
        .footer-links li a:hover::before { width: 12px; }
        .footer-address {
          font-size: 13px; line-height: 1.8;
          color: rgba(255,255,255,0.38);
        }
        .footer-address strong {
          display: block;
          font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 8px; font-weight: 500;
        }

        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px;
          max-width: 1200px; margin: 0 auto;
        }
        .footer-bottom-left {
          font-size: 12px; color: rgba(255,255,255,0.22);
          letter-spacing: 0.3px;
        }
        .footer-bottom-links {
          display: flex; gap: 28px;
        }
        .footer-bottom-links a {
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          text-decoration: none; transition: color 0.2s;
        }
        .footer-bottom-links a:hover { color: rgba(255,255,255,0.6); }

        /* Amber top rule */
        .footer-amber-rule {
          width: 100%; height: 2px;
          background: linear-gradient(90deg, #d4840a 0%, rgba(212,132,10,0.15) 60%, transparent 100%);
        }

        @media (max-width: 900px) {
          .footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
          .footer-inner { padding: 56px 24px 0; }
          .footer-bottom { flex-direction: column; gap: 16px; padding: 22px 24px; text-align: center; }
        }
        @media (max-width: 560px) {
          .footer-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="footer-amber-rule" />
      <div className="footer-orb" />

      <div className="footer-inner">
        <div className="footer-top">

          {/* Brand col */}
          <div>
            <span className="footer-brand-wordmark">SIBOL</span>
            <p className="footer-brand-desc">
              IoT-powered crop monitoring that connects your farm to real-time data — so you grow more, lose less.
            </p>
            <span className="footer-badge">
              <span className="footer-badge-dot" />
              Sensors Active
            </span>
          </div>

          {/* Nav col */}
          <div>
            <div className="footer-col-title">SIBOL</div>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Services col */}
          <div>
            <div className="footer-col-title">Services</div>
            <ul className="footer-links">
              <li><a href="#">Monitoring</a></li>
              <li><a href="#">Data Analytics</a></li>
              <li><a href="#">Alerts</a></li>
            </ul>
          </div>

          {/* Address col */}
          <div>
            <div className="footer-col-title">Location</div>
            <div className="footer-address">
              <strong>Address</strong>
              System Plus Computer College<br />
              141–143 6th Street &amp; 10th Avenue,<br />
              Caloocan, Philippines, 1403
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span className="footer-bottom-left">© {new Date().getFullYear()} SIBOL. All rights reserved.</span>
        <div className="footer-bottom-links">
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer 

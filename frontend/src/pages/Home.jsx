import React from 'react';
import { Link } from 'react-router-dom';

/* ── Marquee ticker items ─────────────────────────────── */
const tickers = [
  'New Arrivals', 'Festive Collection 2025', 'Free Shipping Above ₹2999',
  'Handcrafted Ethnic Wear', 'Premium Banarasi Silk', 'Exclusive Designs',
  'New Arrivals', 'Festive Collection 2025', 'Free Shipping Above ₹2999',
  'Handcrafted Ethnic Wear', 'Premium Banarasi Silk', 'Exclusive Designs',
];

const features = [
  { icon: '👑', title: 'Royal Craftsmanship', desc: 'Each piece handcrafted by master artisans with decades of expertise in ethnic couture.' },
  { icon: '🌿', title: 'Sustainable Luxury', desc: 'Premium silk, cotton & handloom fabrics sourced responsibly. Guilt-free indulgence.' },
  { icon: '✨', title: 'Bespoke Styling', desc: 'Personalised styling for weddings, festivities and every milestone celebration.' },
  { icon: '🚚', title: 'White-Glove Delivery', desc: 'Complimentary express shipping with elegant gift packaging on every order.' },
];

const Home = () => (
  <main className="page-enter">

    {/* ── Gold Marquee Ticker ──────────────────────────── */}
    <div className="marquee-bar" aria-hidden="true">
      <div className="marquee-track">
        {tickers.map((t, i) => (
          <span key={i} className="marquee-item">
            {t} <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>

    {/* ── Hero Section ─────────────────────────────────── */}
    <section id="hero" className="hero-section">
      <div className="container">
        <div className="row align-items-center">

          {/* Left — Copy */}
          <div className="col-lg-7 hero-content">
            <div className="hero-kicker">
              <span className="hero-kicker-line" />
              Premium Ethnic Couture
              <span className="hero-kicker-line" />
            </div>

            <h1 className="hero-h1">
              Wear the<br />
              <span className="shimmer-text">Rhythm</span> of<br />
              Elegance
            </h1>

            <p className="hero-sub">— Tune of Trends —</p>
            <div className="hero-rule" />

            <p className="hero-desc">
              Discover SANGEET's exquisite collection of luxury ethnic wear —
              where every thread tells a story of royal heritage and contemporary grace.
              From shimmering lehengas to regal sherwanis, dressed for every celebration.
            </p>

            <div className="hero-btns">
              <Link to="/products" id="hero-cta" className="btn-royal btn-royal-primary">
                <i className="bi bi-grid-3x3-gap" /> View Collection
              </Link>
              <Link to="/add-product" id="hero-secondary" className="btn-royal btn-royal-ghost">
                <i className="bi bi-plus-circle" /> Add Product
              </Link>
            </div>

            <div className="hero-stats">
              {[['500+', 'Designs'], ['10K+', 'Clients'], ['15+', 'Yrs Legacy']].map(([n, l]) => (
                <div key={l}>
                  <div className="hero-stat-num">{n}</div>
                  <div className="hero-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Brand Art */}
          <div className="col-lg-5 d-none d-lg-flex justify-content-center">
            <div className="hero-art">
              <div className="hero-art-frame">
                <div className="hero-art-ring" aria-hidden="true" />
                <div className="hero-art-inner">
                  <div className="hero-art-lotus">🪷</div>
                  <div className="hero-art-brand">SANGEET</div>
                  <div className="hero-art-tag">Tune of Trends</div>
                  <div className="hero-art-ornament">✦ ✦ ✦</div>
                </div>
                <div className="hero-badge">
                  New Arrivals<br />
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Festive 2025</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* ── Features ─────────────────────────────────────── */}
    <section id="features" className="features-section">
      <div className="container">
        <div className="sec-header">
          <p className="sec-kicker">Why Choose SANGEET</p>
          <h2 className="sec-title">The Royal <span className="gold-word">Promise</span></h2>
          <div className="sec-rule" />
          <p className="sec-desc">A commitment to luxury, heritage, and unmatched quality in every stitch.</p>
        </div>

        <div className="row g-4">
          {features.map((f, i) => (
            <div key={i} className="col-sm-6 col-lg-3">
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA Band ─────────────────────────────────────── */}
    <section id="cta-band" className="cta-band">
      <div className="container">
        <p className="sec-kicker" style={{ color: 'rgba(201,168,76,0.6)', marginBottom: '10px' }}>
          Celebrate Every Occasion
        </p>
        <h2>Explore the Full Collection</h2>
        <Link to="/products" id="cta-explore" className="btn-royal btn-royal-primary">
          <i className="bi bi-grid-3x3-gap" /> Shop Collection
        </Link>
      </div>
    </section>

    {/* ── Footer ───────────────────────────────────────── */}
    <footer className="sangeet-footer">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="footer-brand">SANGEET</div>
            <div className="footer-tag">Tune of Trends</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(245,230,184,0.4)', fontStyle: 'italic', lineHeight: 1.7 }}>
              Luxury ethnic fashion for the modern royal.
            </p>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-4 justify-content-md-end flex-wrap">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/products" className="footer-link">Collection</Link>
              <Link to="/add-product" className="footer-link">Add Product</Link>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <p className="footer-copy">
          © {new Date().getFullYear()} SANGEET – Tune of Trends. Crafted with ❤️ for ethnic fashion lovers.
        </p>
      </div>
    </footer>
  </main>
);

export default Home;

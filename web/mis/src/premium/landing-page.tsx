import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import "./landing.css";

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspace", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    const animatedElements = document.querySelectorAll(
      ".feat-card, .role-card, .testi-card"
    );

    animatedElements.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(18px)";
      htmlEl.style.transition = `opacity 0.55s ease ${(i % 3) * 0.08}s, transform 0.55s ease ${(i % 3) * 0.08}s, border-color 0.2s ease, box-shadow 0.2s ease`;
      observer.observe(htmlEl);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page-wrapper">
      {/* NAV */}
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
              <path d="M12 7v10M2 7l10 5 10-5" />
            </svg>
          </div>
          MakerSpace Ops
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#roles" className="nav-link">
            Who It's For
          </a>
          <a href="#workflow" className="nav-link">
            How It Works
          </a>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <Link to="/workspace" className="nav-cta">
              Go to Workspace
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-signin">
                Sign in
              </Link>
              <Link to="/register" className="nav-cta">
                Try it free →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div
        className="hero"
        style={{
          paddingLeft: "clamp(20px, 5vw, 40px)",
          paddingRight: "clamp(20px, 5vw, 40px)",
        }}
      >
        <div>
          <div className="hero-tag au">
            <span className="hero-tag-dot"></span>Makerspace Operating System
          </div>
          <h1 className="hero-h1 au d1">
            The all-in-one platform for your{" "}
            <span className="accent">lab & makerspace</span>
          </h1>
          <p className="hero-sub au d2">
            Manage your machines, members, inventory, and approvals from one
            place — designed specifically for makerspaces, FabLabs, and academic
            workshops.
          </p>
          <div className="hero-btns au d3">
            {isAuthenticated ? (
              <Link to="/workspace" className="btn-primary">
                Open Workspace →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Try it for free →
                </Link>
                <Link to="/login" className="btn-secondary">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ marginRight: "6px" }}
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="hero-note au d4">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            No commitment. No credit card needed.
          </p>
        </div>

        <div
          className="hero-screenshot au d2"
          style={{ position: "relative", paddingBottom: "20px" }}
        >
          <div className="hero-screenshot-inner">
            <div className="screenshot-topbar">
              <div className="topbar-dots">
                <div
                  className="topbar-dot"
                  style={{ background: "#ff5f57" }}
                ></div>
                <div
                  className="topbar-dot"
                  style={{ background: "#ffbd2e" }}
                ></div>
                <div
                  className="topbar-dot"
                  style={{ background: "#28c840" }}
                ></div>
              </div>
              <div className="topbar-url">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                app.technoventor.io/dashboard
              </div>
            </div>
            <div className="screenshot-body">
              <div className="dash-header">
                <div>
                  <div className="dash-title">Lab Overview</div>
                  <div className="dash-date">Tuesday, June 2, 2026</div>
                </div>
                <span className="status-pill sp-teal">● Live</span>
              </div>
              <div className="dash-kpis">
                <div className="kpi">
                  <div className="kpi-label">Bookings Today</div>
                  <div className="kpi-val">24</div>
                  <div className="kpi-change">↑ 3 new</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Approvals</div>
                  <div className="kpi-val">7</div>
                  <div className="kpi-change warn">Pending</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Members</div>
                  <div className="kpi-val">142</div>
                  <div className="kpi-change">Active now: 18</div>
                </div>
              </div>
              <div className="dash-section-label">Machine Status</div>
              <div className="machine-rows">
                <div className="machine-row-item">
                  <div className="mri-icon ic-teal">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="mri-info">
                    <div className="mri-name">3D Printer — Bay A</div>
                    <div className="mri-sub">Aman M. · until 12:30 PM</div>
                  </div>
                  <span className="status-pill sp-teal">In Use</span>
                </div>
                <div className="machine-row-item">
                  <div className="mri-icon ic-blue">
                    <svg viewBox="0 0 24 24">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                  </div>
                  <div className="mri-info">
                    <div className="mri-name">Laser Cutter</div>
                    <div className="mri-sub">Priya S. · until 2:00 PM</div>
                  </div>
                  <span className="status-pill sp-green">Available</span>
                </div>
                <div className="machine-row-item">
                  <div className="mri-icon ic-amber">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                  </div>
                  <div className="mri-info">
                    <div className="mri-name">CNC Router</div>
                    <div className="mri-sub">Maintenance scheduled</div>
                  </div>
                  <span className="status-pill sp-amber">Offline</span>
                </div>
              </div>
              <div className="dash-section-label" style={{ marginTop: "12px" }}>
                Recent Approvals
              </div>
              <div className="approval-rows">
                <div className="approval-item">
                  <div className="ai-avatar" style={{ background: "#0d9488" }}>
                    AM
                  </div>
                  <div className="ai-text">
                    <div className="ai-name">Aman Mehta</div>
                    <div className="ai-req">Machine booking · 3D Printer A</div>
                  </div>
                  <button className="ai-btn">✓ Approve</button>
                </div>
                <div className="approval-item">
                  <div className="ai-avatar" style={{ background: "#8b5cf6" }}>
                    PS
                  </div>
                  <div className="ai-text">
                    <div className="ai-name">Priya Shah</div>
                    <div className="ai-req">Material order · 500g PLA Filament</div>
                  </div>
                  <button className="ai-btn">✓ Approve</button>
                </div>
              </div>
            </div>
          </div>
          {/* Floating badge */}
          <div className="hero-float-badge">
            <div className="float-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="float-text">
              <div className="ft-top">Booking confirmed</div>
              <div className="ft-bot">Laser Cutter · 10:30 – 12:00 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOS */}
      <div className="logos-strip">
        <div className="logos-inner">
          <span className="logos-label">Trusted by</span>
          <div className="logos-row">
            <span className="logo-text">IIT Mumbai</span>
            <span className="logo-text">FabLab India</span>
            <span className="logo-text">TechWorks</span>
            <span className="logo-text">MakerHub</span>
            <span className="logo-text">BITS Pilani</span>
            <span className="logo-text">Innovate Labs</span>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="centered">
            <span className="section-label">Platform features</span>
            <h2 className="section-h2">
              Everything you need to run
              <br />
              your makerspace smoothly
            </h2>
            <p className="section-lead">
              Purpose-built workflows for shared physical spaces — from booking
              machines to tracking inventory, all under one roof.
            </p>
          </div>
          <div className="feat-grid">
            <div className="feat-card">
              <div className="feat-icon-wrap fi-teal">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="feat-title">Smart machine booking</h3>
              <p className="feat-desc">
                Interactive calendar with real-time availability, custom booking
                windows, no-show grace periods, and automatic double-booking
                prevention.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap fi-teal">
                <svg viewBox="0 0 24 24">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="feat-title">QR scan & IoT access</h3>
              <p className="feat-desc">
                Members scan a QR code on any machine to instantly load their
                booking and start their session. Triggers hardware relay
                unlocking directly from the browser.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap fi-amber">
                <svg viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="feat-title">Inventory & stock tracking</h3>
              <p className="feat-desc">
                Material catalogue with stock adjustment logs, low-stock alerts,
                and custom units per category. Never run out of filament
                mid-print again.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap fi-blue">
                <svg viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="feat-title">Material requests</h3>
              <p className="feat-desc">
                Students request materials for a project with manager approval —
                a clean, streamlined workflow from inventory to usage tracking.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap fi-violet">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="feat-title">Project collaboration</h3>
              <p className="feat-desc">
                Shared project workspaces that link consumed inventory and
                machine time for cost tracking, progress logging, and team
                coordination.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap fi-green">
                <svg viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="feat-title">Unified approval inbox</h3>
              <p className="feat-desc">
                One real-time inbox for lab managers to handle bookings, join
                requests, material orders, and attendance regularizations. No
                more chasing on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT 1: Inventory */}
      <section className="section section-alt" id="workflow">
        <div className="section-inner">
          <div className="split">
            <div className="mock-panel">
              <div className="mock-header">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span className="mock-header-title">Inventory</span>
                <span className="mock-header-badge">3 low-stock alerts</span>
              </div>
              <div className="mock-body">
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#3ecfcb" }}></div>
                  <span className="inv-name">PLA Filament (White)</span>
                  <span className="inv-qty">240g</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "24%", background: "#3ecfcb" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-low">Low</span>
                </div>
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#3b82f6" }}></div>
                  <span className="inv-name">Acrylic Sheet 3mm</span>
                  <span className="inv-qty">18 Nos</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "72%", background: "#3b82f6" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-ok">OK</span>
                </div>
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#f59e0b" }}></div>
                  <span className="inv-name">Solder Wire (60/40)</span>
                  <span className="inv-qty">3 rolls</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "30%", background: "#f59e0b" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-warn">Watch</span>
                </div>
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#8b5cf6" }}></div>
                  <span className="inv-name">MDF Board 6mm</span>
                  <span className="inv-qty">52 Nos</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "85%", background: "#8b5cf6" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-ok">OK</span>
                </div>
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#ef4444" }}></div>
                  <span className="inv-name">Resin (Clear)</span>
                  <span className="inv-qty">120ml</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "12%", background: "#ef4444" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-low">Low</span>
                </div>
                <div className="inv-row">
                  <div className="inv-color" style={{ background: "#22c55e" }}></div>
                  <span className="inv-name">Copper PCB Blank</span>
                  <span className="inv-qty">34 Nos</span>
                  <div className="inv-bar">
                    <div
                      className="inv-bar-fill"
                      style={{ width: "68%", background: "#22c55e" }}
                    ></div>
                  </div>
                  <span className="inv-alert ia-ok">OK</span>
                </div>
              </div>
            </div>
            <div>
              <span className="section-label">Inventory management</span>
              <h2 className="section-h2">
                Stay on top of every material in your lab
              </h2>
              <p className="section-lead" style={{ marginBottom: "32px" }}>
                Track raw materials, consumables, and parts with real-time stock
                levels. Automatic low-stock alerts mean you reorder before you
                run dry — not after.
              </p>
              <div className="split-steps">
                <div className="split-step">
                  <div className="step-dot">1</div>
                  <div className="step-body">
                    <div className="step-title">Manage your catalogue</div>
                    <div className="step-desc">
                      Add materials by category with custom units. Adjust stock
                      on every supply run or scrap event — all logged
                      automatically.
                    </div>
                  </div>
                </div>
                <div className="split-step">
                  <div className="step-dot">2</div>
                  <div className="step-body">
                    <div className="step-title">Get proactive alerts</div>
                    <div className="step-desc">
                      Set a minimum threshold per item. MakerSpace Ops flags
                      low-stock before it becomes a problem for your
                      students.
                    </div>
                  </div>
                </div>
                <div className="split-step">
                  <div className="step-dot">3</div>
                  <div className="step-body">
                    <div className="step-title">Link to projects & orders</div>
                    <div className="step-desc">
                      Every material request ties back to a project for accurate
                      cost reporting across teams.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT 2: QR + Booking */}
      <section className="section">
        <div className="section-inner">
          <div className="split split-reversed">
            <div>
              <span className="section-label">IoT machine access</span>
              <h2 className="section-h2">Scan. Book. Start. It's that simple.</h2>
              <p className="section-lead" style={{ marginBottom: "32px" }}>
                No apps to install. Every machine gets a QR code — members scan
                it from their phone to view their booking and start the session
                instantly.
              </p>
              <div className="split-steps">
                <div className="split-step">
                  <div className="step-dot">1</div>
                  <div className="step-body">
                    <div className="step-title">Book from the calendar</div>
                    <div className="step-desc">
                      Browse live availability, select a slot, and confirm. The
                      calendar prevents double-bookings automatically.
                    </div>
                  </div>
                </div>
                <div className="split-step">
                  <div className="step-dot">2</div>
                  <div className="step-body">
                    <div className="step-title">Scan the machine's QR code</div>
                    <div className="step-desc">
                      Walk up to any machine, open your browser camera, scan the
                      code — your active booking loads instantly.
                    </div>
                  </div>
                </div>
                <div className="split-step">
                  <div className="step-dot">3</div>
                  <div className="step-body">
                    <div className="step-title">Start & stop your session</div>
                    <div className="step-desc">
                      Tap Start to unlock the machine. Tap Stop when done —
                      MakerSpace Ops logs time and can trigger hardware relay
                      control.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mock-panel">
              <div className="mock-header">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                </svg>
                <span className="mock-header-title">Machine Access</span>
                <span className="mock-header-badge">● Camera ready</span>
              </div>
              <div className="mock-body">
                <div className="qr-wrap">
                  <div className="qr-center">
                    <div className="qr-svg-box">
                      <svg
                        width="72"
                        height="72"
                        viewBox="0 0 80 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="26"
                          height="26"
                          rx="4"
                          fill="rgba(62,207,203,0.1)"
                          stroke="#3ecfcb"
                          strokeWidth="2"
                        />
                        <rect
                          x="12"
                          y="12"
                          width="14"
                          height="14"
                          rx="2"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="48"
                          y="6"
                          width="26"
                          height="26"
                          rx="4"
                          fill="rgba(62,207,203,0.1)"
                          stroke="#3ecfcb"
                          strokeWidth="2"
                        />
                        <rect
                          x="54"
                          y="12"
                          width="14"
                          height="14"
                          rx="2"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="6"
                          y="48"
                          width="26"
                          height="26"
                          rx="4"
                          fill="rgba(62,207,203,0.1)"
                          stroke="#3ecfcb"
                          strokeWidth="2"
                        />
                        <rect
                          x="12"
                          y="54"
                          width="14"
                          height="14"
                          rx="2"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="48"
                          y="48"
                          width="8"
                          height="8"
                          rx="1"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="60"
                          y="48"
                          width="8"
                          height="8"
                          rx="1"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="60"
                          y="60"
                          width="8"
                          height="8"
                          rx="1"
                          fill="#3ecfcb"
                        />
                        <rect
                          x="48"
                          y="66"
                          width="8"
                          height="8"
                          rx="1"
                          fill="#3ecfcb"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="qr-scan-hint">
                    Point your camera at any machine's QR code
                  </p>
                  <div className="qr-booking-card">
                    <div className="qbc-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                    </div>
                    <div className="qbc-info">
                      <div className="qbc-title">Laser Cutter — Bay 2</div>
                      <div className="qbc-time">
                        10:30 AM – 12:00 PM · Aman M.
                      </div>
                    </div>
                    <button className="qbc-btn">▶ Start</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className="status-pill sp-teal">
                      Active booking found
                    </span>
                    <span className="status-pill sp-gray">Relay: ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section section-alt" id="roles">
        <div className="section-inner">
          <div className="centered" style={{ marginBottom: "48px" }}>
            <span className="section-label">Designed for every role</span>
            <h2 className="section-h2">
              One platform, purpose-built
              <br />
              for your whole team
            </h2>
          </div>
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-card-accent"></div>
              <div className="role-num">01</div>
              <h3 className="role-title">Student</h3>
              <p className="role-desc">
                Standard members who interact with the space daily.
              </p>
              <div className="role-caps">
                <div className="role-cap">
                  <span className="rc-dot"></span>Book machines & scan QR to
                  start sessions
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Track active projects &
                  consumed materials
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Request inventory for projects
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Log check-in / check-out
                  attendance
                </div>
              </div>
            </div>
            <div className="role-card">
              <div className="role-card-accent"></div>
              <div className="role-num">02</div>
              <h3 className="role-title">Lab Manager</h3>
              <p className="role-desc">
                Facilitators who oversee approvals and daily operations.
              </p>
              <div className="role-caps">
                <div className="role-cap">
                  <span className="rc-dot"></span>Unified approval inbox for all
                  request types
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Monitor machine status &
                  utilisation
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Manage inventory stock &
                  reorder alerts
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Approve attendance
                  regularizations
                </div>
              </div>
            </div>
            <div className="role-card">
              <div className="role-card-accent"></div>
              <div className="role-num">03</div>
              <h3 className="role-title">Organisation Admin</h3>
              <p className="role-desc">
                Institutional tenants who manage billing and access.
              </p>
              <div className="role-caps">
                <div className="role-cap">
                  <span className="rc-dot"></span>Manage subscriptions & billing
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Configure default lab settings
                  & policies
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Control roles, permissions,
                  and onboarding
                </div>
                <div className="role-cap">
                  <span className="rc-dot"></span>Multi-lab context switching
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="section-inner">
          <div className="centered" style={{ marginBottom: "48px" }}>
            <span className="section-label">What people say</span>
            <h2 className="section-h2">
              Loved by the makerspace
              <br />
              community
            </h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card">
              <div className="testi-quote-mark">"</div>
              <p className="testi-text">
                MakerSpace Ops completely replaced our spreadsheets and WhatsApp
                group. Booking conflicts dropped to zero in the first week.
              </p>
              <div className="testi-person">
                <div className="testi-avatar" style={{ background: "#0d9488" }}>
                  AM
                </div>
                <div>
                  <div className="testi-name">Aman Mehta</div>
                  <div className="testi-role">Lab Manager · FabLab Mumbai</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-mark">"</div>
              <p className="testi-text">
                The QR machine access is a game-changer. Students just scan and
                start — no logins, no friction. It's exactly what a busy
                workshop needs.
              </p>
              <div className="testi-person">
                <div className="testi-avatar" style={{ background: "#7c3aed" }}>
                  SR
                </div>
                <div>
                  <div className="testi-name">Shreya Rajan</div>
                  <div className="testi-role">
                    Faculty Coordinator · IIT Design Studio
                  </div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-mark">"</div>
              <p className="testi-text">
                Finally a platform that understands multi-role workflows. Our
                students, managers, and admins all see exactly what they need
                — nothing more.
              </p>
              <div className="testi-person">
                <div className="testi-avatar" style={{ background: "#2563eb" }}>
                  PK
                </div>
                <div>
                  <div className="testi-name">Prasad Kulkarni</div>
                  <div className="testi-role">
                    Organisation Admin · MakerHub Pune
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <div className="stat-num">200+</div>
            <div className="stat-label">Active students onboarded</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">12+</div>
            <div className="stat-label">Institutions & makerspaces</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">98%</div>
            <div className="stat-label">Reduction in booking conflicts</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">&lt;4h</div>
            <div className="stat-label">Average time to go live</div>
          </div>
        </div>
      </div>

      {/* API */}
      <div className="api-section">
        <div className="api-inner">
          <div>
            <span className="api-label">Built for extension</span>
            <h2 className="api-h2">Full API access for your developers</h2>
            <p className="api-desc">
              All platform data and functionality is available via our open REST
              API. Import existing data, integrate your favourite tools, or
              build custom extensions on top of MakerSpace Ops.
            </p>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--teal)",
                color: "white",
                padding: "11px 22px",
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily: "var(--font-head)",
                fontSize: "14px",
                fontWeight: 800,
                transition: "background 0.2s ease",
              }}
            >
              View API docs →
            </a>
          </div>
          <div className="code-block">
            <span className="c-teal">GET</span>{" "}
            <span className="c-white">/api/v1/machines?lab=42</span>
            <br />
            <span className="c-amber">Authorization:</span> Bearer{" "}
            <span className="c-green">your-api-key</span>
            <br />
            <br />
            <span className="c-white">[</span>
            <br />
            <span className="c-white">{"  "}&#123;</span>
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"id"</span>:{" "}
            <span className="c-green">1104</span>,
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"name"</span>:{" "}
            <span className="c-green">"3D Printer — Bay A"</span>,
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"status"</span>:{" "}
            <span className="c-green">"in_use"</span>,
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"currentBooking"</span>:{" "}
            <span className="c-white">&#123;</span>
            <br />
            <span className="c-white">{"      "}</span>
            <span className="c-amber">"member"</span>:{" "}
            <span className="c-green">"Aman Mehta"</span>,
            <br />
            <span className="c-white">{"      "}</span>
            <span className="c-amber">"endsAt"</span>:{" "}
            <span className="c-green">"2026-06-02T12:30:00Z"</span>
            <br />
            <span className="c-white">{"    "}&#125;</span>
            <br />
            <span className="c-white">{"  "}&#125;,</span>
            <br />
            <span className="c-white">{"  "}&#123;</span>
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"id"</span>:{" "}
            <span className="c-green">1105</span>,
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"name"</span>:{" "}
            <span className="c-green">"Laser Cutter"</span>,
            <br />
            <span className="c-white">{"    "}</span>
            <span className="c-amber">"status"</span>:{" "}
            <span className="c-green">"available"</span>
            <br />
            <span className="c-white">{"  "}&#125;</span>
            <br />
            <span className="c-white">]</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-h2">Ready to modernise your makerspace?</h2>
          <p className="cta-sub">
            Join makerspaces and institutions that have already moved beyond
            spreadsheets. Get set up in less than a day.
          </p>
          <div className="cta-btns">
            {isAuthenticated ? (
              <Link to="/workspace" className="btn-primary">
                Open Workspace →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Try it for free →
                </Link>
                <Link to="/login" className="btn-secondary">
                  Request a demo call
                </Link>
              </>
            )}
          </div>
          <p className="cta-note">No commitment. No credit card needed.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <Link to="/" className="footer-logo">
                <div className="nav-logo-mark">
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: "17px",
                      height: "17px",
                      stroke: "white",
                      fill: "none",
                      strokeWidth: 2.2,
                      strokeLinecap: "round",
                    }}
                  >
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
                    <path d="M12 7v10M2 7l10 5 10-5" />
                  </svg>
                </div>
                MakerSpace Ops
              </Link>
              <p className="footer-tagline">
                A modern multi-tenant SaaS platform for managing makerspaces,
                FabLabs, and academic laboratories.
              </p>
            </div>
            <div>
              <p className="footer-col-title">Platform</p>
              <div className="footer-links">
                <a href="#features" className="footer-link">
                  Machine Booking
                </a>
                <a href="#features" className="footer-link">
                  Inventory
                </a>
                <a href="#features" className="footer-link">
                  Project Collaboration
                </a>
                <a href="#features" className="footer-link">
                  Approval Workflows
                </a>
                <a href="#features" className="footer-link">
                  Attendance Tracking
                </a>
              </div>
            </div>
            <div>
              <p className="footer-col-title">Company</p>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  About
                </a>
                <a href="#" className="footer-link">
                  Blog
                </a>
                <a href="#" className="footer-link">
                  Pricing
                </a>
                <a href="#" className="footer-link">
                  Careers
                </a>
                <a href="#" className="footer-link">
                  Contact
                </a>
              </div>
            </div>
            <div>
              <p className="footer-col-title">Support</p>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  Help & FAQ
                </a>
                <a href="#" className="footer-link">
                  Forum
                </a>
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
                <a href="#" className="footer-link">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">
              © 2026 MakerSpace Ops
            </p>
            <div className="footer-social">
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

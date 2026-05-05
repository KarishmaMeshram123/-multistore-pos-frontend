import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Counter({ end, prefix = '', suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, end);
      setVal(Math.floor(start));
      if (start >= end) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

function FeatureCard({ icon, title, desc, delay, color }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`${styles.featureCard} ${visible ? styles.visible : ''}`}
      style={{ transitionDelay: delay, '--card-color': color }}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}

function Step({ num, title, desc, delay }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`${styles.step} ${visible ? styles.visible : ''}`} style={{ transitionDelay: delay }}>
      <div className={styles.stepNum}>{num}</div>
      <div>
        <h4 className={styles.stepTitle}>{title}</h4>
        <p className={styles.stepDesc}>{desc}</p>
      </div>
    </div>
  );
}

function RoleCard({ icon, role, perms, delay }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`${styles.roleCard} ${visible ? styles.visible : ''}`} style={{ transitionDelay: delay }}>
      <div className={styles.roleIcon}>{icon}</div>
      <h4 className={styles.roleTitle}>{role}</h4>
      <ul className={styles.rolePerms}>
        {perms.map(p => <li key={p}><span className={styles.check}>✓</span>{p}</li>)}
      </ul>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.root}>

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 28 28" fill="none" width="17" height="17">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/>
                <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
            <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
          </div>

          <div className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
            <a href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#roles" className={styles.navLink} onClick={() => setMenuOpen(false)}>Roles</a>
            <a href="#payments" className={styles.navLink} onClick={() => setMenuOpen(false)}>Payments</a>
          </div>

          <div className={styles.navCta}>
            <Link to="/login" className={styles.navLogin}>Sign In</Link>
            <Link to="/setup" className={styles.navStart}>Get Started →</Link>
          </div>
          <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden>
          <div className={styles.orb1} /><div className={styles.orb2} /><div className={styles.orb3} />
          <div className={styles.grid} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><span className={styles.badgeDot} />Multi-Tenant SaaS · Razorpay Integrated</div>
          <h1 className={styles.heroTitle}>The Smartest POS<br /><span className={styles.heroGrad}>for Every Store.</span></h1>
          <p className={styles.heroDesc}>
            MultiStore Sync POS is a complete, enterprise-grade point-of-sale system with tenant isolation,
            role-based access, real-time inventory, Razorpay payments, and advanced analytics — all in one platform.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/setup" className={styles.ctaPrimary}>Start Free Today <span className={styles.ctaArrow}>→</span></Link>
            <Link to="/login" className={styles.ctaSecondary}>Sign In to Dashboard</Link>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.metaItem}><span className={styles.metaDot} style={{ background:'#34d399' }} />No credit card required</div>
            <div className={styles.metaItem}><span className={styles.metaDot} style={{ background:'#60a5fa' }} />Razorpay + Cash payments</div>
            <div className={styles.metaItem}><span className={styles.metaDot} style={{ background:'#a78bfa' }} />Full data isolation</div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className={styles.heroMockup} aria-hidden>
          <div className={styles.mockupWindow}>
            <div className={styles.mockupBar}>
              <span className={styles.dot} style={{ background:'#f87171' }} />
              <span className={styles.dot} style={{ background:'#fbbf24' }} />
              <span className={styles.dot} style={{ background:'#34d399' }} />
              <span className={styles.mockupUrl}>multistore-sync-pos · Billing</span>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupSidebar}>
                {['Dashboard','Products','Inventory','Billing','Orders','Reports'].map((item, i) => (
                  <div key={item} className={`${styles.mockupNavItem} ${i === 3 ? styles.mockupNavActive : ''}`}>
                    <span className={styles.mockupNavDot} />{item}
                  </div>
                ))}
              </div>
              <div className={styles.mockupMain}>
                <div className={styles.mockupStatRow}>
                  {[
                    { label:'Revenue', val:'₹1,24,890', color:'#6366f1' },
                    { label:'Orders', val:'342', color:'#34d399' },
                    { label:'Products', val:'89', color:'#f97316' },
                    { label:'Stock', val:'1.2K', color:'#a78bfa' },
                  ].map(s => (
                    <div key={s.label} className={styles.mockupStat} style={{ '--stat-color': s.color }}>
                      <div className={styles.mockupStatIcon} />
                      <div className={styles.mockupStatVal}>{s.val}</div>
                      <div className={styles.mockupStatLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Payment modal preview */}
                <div className={styles.mockupPayment}>
                  <div className={styles.mockupPayTitle}>Choose Payment</div>
                  <div className={styles.mockupPayOption} style={{ borderColor:'#6366f1', background:'rgba(99,102,241,0.1)' }}>
                    <span style={{ fontSize:'0.6rem' }}>💳</span>
                    <span>Razorpay · UPI / Card</span>
                  </div>
                  <div className={styles.mockupPayOption}>
                    <span style={{ fontSize:'0.6rem' }}>💵</span>
                    <span>Cash Payment</span>
                  </div>
                  <div className={styles.mockupPayBtn}>Confirm Payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsBand} id="stats">
        <div className={styles.statsInner}>
          {[
            { end:99, suffix:'.9%', label:'Uptime SLA' },
            { end:3, suffix:' roles', label:'Access Levels' },
            { end:2, suffix:' payments', label:'Cash + Razorpay' },
            { end:100, suffix:'%', label:'Data Isolated' },
          ].map((s, i) => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statNum}><Counter end={s.end} suffix={s.suffix} duration={1400 + i * 200} /></div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Features</div>
          <h2 className={styles.sectionTitle}>Everything you need to run your store</h2>
          <p className={styles.sectionSub}>MultiStore Sync POS packs enterprise-level capabilities into a clean, intuitive interface.</p>
          <div className={styles.featuresGrid}>
            <FeatureCard delay="0s" color="#6366f1" icon="🏪" title="Multi-Tenant Architecture" desc="Each store lives in complete isolation. Data, users, and settings are fully separated between tenants with zero cross-contamination." />
            <FeatureCard delay="0.07s" color="#8b5cf6" icon="🔐" title="Role-Based Access Control" desc="Assign Admin, Manager, or Cashier roles. Each role sees only what they need — no more, no less." />
            <FeatureCard delay="0.14s" color="#06b6d4" icon="📦" title="Real-Time Inventory" desc="Track stock levels live. Get instant low-stock alerts and out-of-stock warnings before they become problems." />
            <FeatureCard delay="0.21s" color="#059669" icon="💳" title="Razorpay + Cash Payments" desc="Accept payments via UPI, Cards, Netbanking, Wallets through Razorpay — or simply mark as Cash. Full flexibility at the counter." />
            <FeatureCard delay="0.28s" color="#f97316" icon="📊" title="Sales Analytics & Reports" desc="Interactive charts, top product rankings, daily revenue breakdowns — all the insights you need to grow." />
            <FeatureCard delay="0.35s" color="#ec4899" icon="⚡" title="Lightning Fast" desc="Built on Spring Boot + React with JWT auth. Sub-100ms API responses. No bloat, no slow page loads." />
          </div>
        </div>
      </section>

      {/* ── PAYMENT SECTION ── */}
      <section className={styles.section} id="payments" style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Payments</div>
          <h2 className={styles.sectionTitle}>Accept payments your way</h2>
          <p className={styles.sectionSub}>Every bill can be paid via Razorpay or Cash — cashier and manager choose at checkout.</p>
          <div className={styles.payGrid}>
            <div className={styles.payCard}>
              <div className={styles.payCardIcon} style={{ background:'rgba(37,99,235,0.12)', color:'#60a5fa' }}>💳</div>
              <h3 className={styles.payCardTitle}>Razorpay Online</h3>
              <p className={styles.payCardDesc}>UPI, Debit/Credit Cards, Netbanking, Wallets — all in one seamless popup. India's most trusted payment gateway.</p>
              <div className={styles.payCardBadges}>
                <span className={styles.payBadge}>UPI</span>
                <span className={styles.payBadge}>Cards</span>
                <span className={styles.payBadge}>Netbanking</span>
                <span className={styles.payBadge}>Wallets</span>
              </div>
            </div>
            <div className={styles.payCard}>
              <div className={styles.payCardIcon} style={{ background:'rgba(5,150,105,0.12)', color:'#34d399' }}>💵</div>
              <h3 className={styles.payCardTitle}>Cash at Counter</h3>
              <p className={styles.payCardDesc}>Customer pays with cash directly. One click to confirm — order is marked as cash payment instantly.</p>
              <div className={styles.payCardBadges}>
                <span className={styles.payBadge} style={{ background:'rgba(5,150,105,0.12)', color:'#34d399' }}>Instant</span>
                <span className={styles.payBadge} style={{ background:'rgba(5,150,105,0.12)', color:'#34d399' }}>No gateway</span>
                <span className={styles.payBadge} style={{ background:'rgba(5,150,105,0.12)', color:'#34d399' }}>Offline safe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>How It Works</div>
          <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
          <p className={styles.sectionSub}>Three simple steps to your first sale.</p>
          <div className={styles.stepsWrap}>
            <div className={styles.stepsLine} aria-hidden />
            <div className={styles.stepsGrid}>
              <Step num="01" delay="0s" title="Create Your Store" desc="Enter your store name and email. Get a unique Tenant ID that isolates your data from every other store on the platform." />
              <Step num="02" delay="0.1s" title="Register Your Team" desc="Share your Tenant ID with staff. Assign Admin, Manager, or Cashier roles. Each login automatically scopes to your store." />
              <Step num="03" delay="0.2s" title="Start Selling & Accepting Payments" desc="Add products, manage inventory, create bills, and accept payments via Razorpay or Cash. Analytics update in real time." />
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className={styles.section} id="roles">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Access Control</div>
          <h2 className={styles.sectionTitle}>The right access for every role</h2>
          <p className={styles.sectionSub}>Fine-grained permissions keep your business secure and your team focused.</p>
          <div className={styles.rolesGrid}>
            <RoleCard delay="0s" icon="👑" role="Admin" perms={['Full platform access','Manage products & inventory','Create & view all orders','Access sales reports','Invite & manage team']} />
            <RoleCard delay="0.1s" icon="🧑‍💼" role="Manager" perms={['Manage products & inventory','Create & view orders','Accept Razorpay / Cash','Access sales analytics']} />
            <RoleCard delay="0.2s" icon="🧑‍💻" role="Cashier" perms={['View product catalogue','Create new bills','Accept Razorpay / Cash','Process transactions']} />
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className={styles.techSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Tech Stack</div>
          <h2 className={styles.sectionTitle}>Built with battle-tested technology</h2>
          <div className={styles.techGrid}>
            {[
              { icon:'☕', name:'Spring Boot', desc:'Java backend', color:'#f97316' },
              { icon:'⚛️', name:'React 18', desc:'Frontend UI', color:'#60a5fa' },
              { icon:'🔑', name:'JWT Auth', desc:'Secure tokens', color:'#34d399' },
              { icon:'🗄️', name:'JPA / SQL', desc:'Data layer', color:'#a78bfa' },
              { icon:'💳', name:'Razorpay', desc:'Payments', color:'#2563eb' },
              { icon:'⚡', name:'Vite', desc:'Build tool', color:'#fbbf24' },
            ].map((t, i) => (
              <div key={t.name} className={styles.techCard} style={{ animationDelay:`${i*0.07}s`, '--tech-color':t.color }}>
                <div className={styles.techIcon}>{t.icon}</div>
                <div className={styles.techName}>{t.name}</div>
                <div className={styles.techDesc}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} aria-hidden>
          <div className={styles.ctaOrb1} /><div className={styles.ctaOrb2} />
        </div>
        <div className={styles.ctaBannerContent}>
          <h2 className={styles.ctaBannerTitle}>Ready to sync your store operations?</h2>
          <p className={styles.ctaBannerSub}>Set up your store in under 2 minutes. Accept payments from day one.</p>
          <div className={styles.ctaBannerActions}>
            <Link to="/setup" className={styles.ctaBannerBtn}>Create Your Store →</Link>
            <Link to="/login" className={styles.ctaBannerLogin}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.brand}>
              <div className={styles.brandIcon}>
                <svg viewBox="0 0 28 28" fill="none" width="14" height="14">
                  <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/>
                  <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/>
                </svg>
              </div>
              <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
            </div>
            <p className={styles.footerTagline}>Multi-Tenant Point of Sale · Razorpay Integrated</p>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/setup" className={styles.footerLink}>Create Store</Link>
            <Link to="/login" className={styles.footerLink}>Sign In</Link>
            <Link to="/register" className={styles.footerLink}>Register</Link>
          </div>
          <div className={styles.footerCopy}>© {new Date().getFullYear()} MultiStore Sync POS. Built with ❤️</div>
        </div>
      </footer>
    </div>
  );
}

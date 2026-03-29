'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, QrCode, Zap, Lock, ChevronRight, ExternalLink, Leaf, Globe, BarChart3, Shield } from 'lucide-react';
import VeritasLogo from '@/components/ui/VeritasLogo';

/* ── Animated counter ───────────────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let n = 0;
    const step = end / 55;
    const t = setInterval(() => {
      n += step;
      if (n >= end) { setVal(end); clearInterval(t); }
      else setVal(Math.floor(n));
    }, 18);
    return () => clearInterval(t);
  }, [end]);
  return <>{val.toLocaleString()}{suffix}</>;
}

const HEDERA_TOPIC = '0.0.4847638';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goto = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ── ambient glow layer ─ */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* top centre emerald */}
        <div style={{ position: 'absolute', top: -300, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.09) 0%, transparent 70%)', filter: 'blur(0px)' }} />
        {/* bottom right teal */}
        <div style={{ position: 'absolute', bottom: '10%', right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)' }} />
        {/* dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ══════════════════════════════
           NAV
         ══════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(8,12,14,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <VeritasLogo size={28} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Veritas
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['How it works', 'how-it-works'], ['Industries', 'use-cases']].map(([label, id]) => (
              <button key={id} onClick={() => goto(id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, color: 'var(--text-muted)',
                letterSpacing: '-0.01em', padding: 0,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
              >{label}</button>
            ))}

            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.10)' }} />

            <Link href="/verify" style={{
              fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
              textDecoration: 'none', letterSpacing: '-0.01em',
              transition: 'color 0.2s'
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >Verify</Link>

            <Link href="/submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.28)',
              color: '#10b981', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', letterSpacing: '-0.01em',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(16,185,129,0.2)'; el.style.borderColor = 'rgba(16,185,129,0.5)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(16,185,129,0.12)'; el.style.borderColor = 'rgba(16,185,129,0.28)'; }}
            >
              Submit claim
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════
           HERO
         ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 148, paddingBottom: 100, paddingInline: 28, maxWidth: 1120, margin: '0 auto' }}>

        {/* eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px rgba(16,185,129,0.6)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#10b981' }}>
            Live on Hedera · Topic {HEDERA_TOPIC}
          </span>
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(38px, 5.5vw, 76px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.03,
          maxWidth: 780,
          marginBottom: 26,
        }}>
          <span style={{ color: 'var(--text-primary)' }}>Stop trusting.</span>
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Start verifying.</span>
        </h1>

        {/* sub */}
        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 520, lineHeight: 1.7,
          letterSpacing: '-0.01em',
          marginBottom: 44,
        }}>
          Veritas puts sustainability claims on the Hedera blockchain — immutable, timestamped, and scannable by anyone in under 5 seconds.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 72 }}>
          <Link href="/verify/COFFEE-2024-1001" className="btn-primary" style={{ fontSize: 15 }}>
            <QrCode size={16} />
            Try a live scan
          </Link>
          <Link href="/submit" className="btn-secondary" style={{ fontSize: 15 }}>
            Submit your product
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── split: stats left / phone right ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, alignItems: 'center' }}>

          {/* left — numbers */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 40px' }}>
              {[
                { n: 1247, suf: '+', label: 'Products verified on-chain' },
                { n: 98,   suf: '.5%', label: 'Average trust score' },
                { n: 3,    suf: '-5s', label: 'Hedera finality time' },
                { n: 52,   suf: 'B+',  label: 'Counterfeit market addressed' },
              ].map(({ n, suf, label }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(30px, 3vw, 44px)',
                    fontWeight: 800,
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #e2fef2 0%, #10b981 60%)',
                    backgroundClip: 'text', WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 6,
                  }}>
                    <Counter end={n} suffix={suf} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* hedera link */}
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                hashscan.io/testnet/topic/{HEDERA_TOPIC}
              </div>
              <ExternalLink size={11} color="var(--text-muted)" />
            </div>
          </div>

          {/* right — phone */}
          <div className="animate-float" style={{ position: 'relative' }}>
            {/* soft glow behind phone */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300, height: 400,
              background: 'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            {/* phone frame */}
            <div style={{
              background: '#0d1214',
              borderRadius: 40,
              padding: 8,
              boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
              position: 'relative',
            }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 33, overflow: 'hidden', height: 500 }}>

                {/* notch */}
                <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 110, height: 26, background: '#000', borderRadius: 18, zIndex: 5 }} />

                {/* status bar */}
                <div style={{ height: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingInline: 18, paddingBottom: 6, position: 'relative', zIndex: 4 }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>9:41</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>●●●</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>WiFi</span>
                  </div>
                </div>

                {/* app header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingInline: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <VeritasLogo size={22} />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Veritas</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: 'rgba(16,185,129,0.14)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>Verified</span>
                </div>

                {/* card */}
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>☕</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>Colombian Coffee</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>COFFEE-2024-1001</div>
                      </div>
                      <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}>
                        <CheckCircle size={12} color="#fff" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Verification score</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>98.5%</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ width: '98.5%', height: '100%', background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: 2 }} />
                    </div>
                  </div>

                  {/* claims */}
                  {[
                    { label: '100% Organic Certified', icon: <Leaf size={10} />, c: '#10b981' },
                    { label: 'Fair Trade USA #FT-2024', icon: <CheckCircle size={10} />, c: '#06b6d4' },
                    { label: 'Carbon Neutral', icon: <Globe size={10} />, c: '#8b5cf6' },
                  ].map(({ label, icon, c }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                      <span style={{ color: c }}>{icon}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                      <Lock size={9} color={c} />
                    </div>
                  ))}

                  <div style={{ background: 'linear-gradient(90deg,#10b981,#0ea5e9)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    <QrCode size={13} /> Scan New Product
                  </div>
                </div>

                {/* home bar */}
                <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 100, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
           PROBLEM → SOLUTION
         ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, paddingBlock: 100, paddingInline: 28, maxWidth: 1120, margin: '0 auto' }}>

        {/* divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)', marginBottom: 80 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* problem */}
          <div style={{ padding: 40, borderRadius: 20, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.08),transparent 70%)' }} />
            <div style={{ fontSize: 34, marginBottom: 20 }}>❓</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 10 }}>The problem</div>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 24, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.2 }}>
              73% of consumers can't verify a single sustainability claim.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
              "Organic", "Fair Trade", "Carbon Neutral" — these words live only in marketing, with nothing on chain to back them up.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Greenwashing is rampant', 'No public audit trail', 'Consumers have no recourse'].map(t => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* solution */}
          <div style={{ padding: 40, borderRadius: 20, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)' }} />
            <div style={{ marginBottom: 20 }}>
              <Shield size={32} color="#10b981" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#10b981', marginBottom: 10 }}>The fix</div>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 24, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.2 }}>
              Immutable proof locked on Hedera, readable by anyone.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
              Every claim gets hashed, timestamped, and stored on-chain via Hedera Consensus Service. Then surfaced via a QR code on the product itself.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Tamper-proof blockchain record', 'QR links to verified proof', '3-5 second on-chain finality'].map(t => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
           HOW IT WORKS
         ══════════════════════════════ */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, paddingBlock: 100, paddingInline: 28, maxWidth: 1120, margin: '0 auto' }}>

        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#10b981', marginBottom: 10 }}>Process</div>
          <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,3.5vw,46px)', letterSpacing: '-0.035em', color: 'var(--text-primary)', maxWidth: 540, lineHeight: 1.1 }}>
            Three steps from claim to consumer trust
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { num: '01', icon: '📋', title: 'Submit', sub: 'Brands', desc: 'Fill in product details and sustainability claims with supporting evidence through the dashboard.', color: '#6366f1' },
            { num: '02', icon: '⛓️', title: 'Anchor', sub: 'Hedera HCS', desc: 'Each claim is hashed and posted to Hedera Consensus Service — immutable, timestamped, public.', color: '#10b981' },
            { num: '03', icon: '📱', title: 'Verify', sub: 'Anyone', desc: 'Scan the QR code on the packaging. The app fetches and displays the on-chain record in real time.', color: '#0ea5e9' },
          ].map(({ num, icon, title, sub, desc, color }) => (
            <div key={num} className="card" style={{ padding: 32, borderColor: `${color}22`, position: 'relative', overflow: 'hidden' }}>
              {/* watermark */}
              <div style={{ position: 'absolute', right: -8, top: -16, fontFamily: 'Space Grotesk,sans-serif', fontWeight: 900, fontSize: 80, color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none', letterSpacing: '-0.05em' }}>{num}</div>

              <div style={{ fontSize: 28, marginBottom: 20 }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color, marginBottom: 6 }}>Step {num} · {sub}</div>
              <h3 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <Link href="/submit" className="btn-primary" style={{ fontSize: 14 }}>
            Get started
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════
           INDUSTRIES
         ══════════════════════════════ */}
      <section id="use-cases" style={{ position: 'relative', zIndex: 1, paddingBlock: 100, paddingInline: 28, maxWidth: 1120, margin: '0 auto' }}>

        {/* section header — intentionally left-aligned unlike the rest, feels human */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#10b981', marginBottom: 10 }}>Industries</div>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3vw,42px)', letterSpacing: '-0.035em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Built for every product,<br />every shelf.
            </h2>
          </div>
          <Link href="/submit" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            See all use cases <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {[
            { emoji: '☕', title: 'Food & Beverage', desc: 'Organic certifications, origin tracking, fair trade proof — all on-chain before the beans hit the shelf.', tags: ['Organic', 'Fair Trade', 'Origin'], accent: '#f59e0b' },
            { emoji: '👕', title: 'Fashion & Apparel', desc: 'Ethical labor, GOTS-certified materials, and recycled content — verified before the tag is sewn in.', tags: ['Ethical Labor', 'GOTS', 'Recycled'], accent: '#ec4899' },
            { emoji: '📱', title: 'Electronics', desc: 'Conflict-free minerals, energy ratings, e-waste programs — with a chain of custody that\'s fully auditable.', tags: ['Conflict-Free', 'Energy Star', 'E-Waste'], accent: '#06b6d4' },
            { emoji: '💊', title: 'Pharmaceuticals', desc: 'Cold chain data, batch authenticity, expiration verification — patient safety baked into every package.', tags: ['Cold Chain', 'Authentic', 'Expiry'], accent: '#8b5cf6' },
          ].map(({ emoji, title, desc, tags, accent }) => (
            <div key={title} className="card" style={{ padding: 28, borderColor: `${accent}18`, cursor: 'default' }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{emoji}</div>
              <h3 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>{desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
           CTA
         ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, paddingBlock: 80, paddingInline: 28, maxWidth: 1120, margin: '0 auto' }}>
        <div style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg,rgba(16,185,129,0.10) 0%,rgba(6,182,212,0.07) 100%)',
          border: '1px solid rgba(16,185,129,0.18)',
          padding: 'clamp(40px,6vw,72px)',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 40,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* glow */}
          <div aria-hidden style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 800, fontSize: 'clamp(24px,3vw,40px)', letterSpacing: '-0.035em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.15 }}>
              Ready to build<br />
              <span style={{ background: 'linear-gradient(90deg,#10b981,#06b6d4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>authentic trust?</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6 }}>
              Submit your first product in under 2 minutes. Or scan one of our demo products to see the full verification flow.
            </p>

            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: '☕ Coffee', id: 'COFFEE-2024-1001' },
                { label: '👕 T-Shirt', id: 'SHIRT-ECO-2024-456' },
                { label: '📱 Phone', id: 'PHONE-REF-2024-789' },
              ].map(({ label, id }) => (
                <Link key={id} href={`/verify/${id}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11, color: 'var(--text-muted)',
                  textDecoration: 'none', fontFamily: 'JetBrains Mono,monospace',
                  letterSpacing: '0.01em', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(16,185,129,0.3)'; el.style.color = '#10b981'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'var(--text-muted)'; }}
                >
                  {label} · {id} <ChevronRight size={10} />
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, position: 'relative' }}>
            <Link href="/submit" className="btn-primary" style={{ fontSize: 15 }}>
              Submit a product
              <ArrowRight size={15} />
            </Link>
            <Link href="/verify" className="btn-secondary" style={{ fontSize: 14 }}>
              Verify a product
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
           FOOTER
         ══════════════════════════════ */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', paddingBlock: 36, paddingInline: 28 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

          {/* brand — same logo as nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VeritasLogo size={22} />
            <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.025em', color: 'var(--text-secondary)' }}>Veritas</span>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {[['Verify', '/verify'], ['Submit', '/submit'], ['Demo', '/demo']].map(([l, h]) => (
              <Link key={h} href={h} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>{l}</Link>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Built on Hedera · MIT License
          </div>
        </div>
      </footer>
    </div>
  );
}
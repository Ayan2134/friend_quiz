import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-atmosphere" aria-hidden />
      <div className="landing-glow" aria-hidden />

      <div className="landing-frame">
        <p className="brand-mark brand-hero">KnowMe</p>

        <div className="landing-copy">
          <h1 className="landing-headline">
            How well do your friends actually know you?
          </h1>
          <p className="landing-sub">
            Make a quiz about yourself, send one link, and watch the scores — and
            the receipts — roll in.
          </p>
          <div className="landing-cta">
            <Link href="/create" className="btn-primary btn-lg btn-block-mobile">
              Make a quiz about you
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>Handcrafted Haven</p>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#featured">Featured</a>
          <a href="#why">Why Us</a>
          <a href="#next">Next Steps</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>WDD 430 Group Project</p>
          <h1>
            Discover handmade goods made by real artisans, one story at a time.
          </h1>
          <p>
            This starter page begins our Handcrafted Haven experience with a
            welcoming marketplace concept, clear category browsing, and space
            for trusted reviews and seller profiles.
          </p>
          <div className={styles.ctas}>
            <button type="button" className={styles.primary}>
              Explore Products
            </button>
            <button type="button" className={styles.secondary}>
              Meet Sellers
            </button>
          </div>
        </section>

        <section id="featured" className={styles.gridSection}>
          <h2>Featured Categories</h2>
          <div className={styles.cards}>
            <article className={styles.card}>
              <h3>Home Decor</h3>
              <p>
                Handmade accents, ceramics, and textiles that add warmth to any
                room.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Wearables</h3>
              <p>
                Artisan-made jewelry, accessories, and clothing with a personal
                touch.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Gift Ideas</h3>
              <p>
                One-of-a-kind items for birthdays, celebrations, and meaningful
                milestones.
              </p>
            </article>
          </div>
        </section>

        <section id="why" className={styles.why}>
          <h2>Why Handcrafted Haven</h2>
          <ul>
            <li>Seller profiles with stories and craftsmanship highlights</li>
            <li>Filterable product listings by category and price</li>
            <li>Community trust through ratings and written reviews</li>
          </ul>
        </section>

        <section id="next" className={styles.nextSteps}>
          <h2>Group Build Next</h2>
          <p>
            Next iterations can connect this page to auth flows, live product
            data, and the shared app shell defined in our planning notes.
          </p>
          <p className={styles.note}>
            Starter status: landing page only, designed as a baseline for team
            collaboration.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Built by WDD 430 Group 6</p>
        <p>Week 03 kickoff landing start</p>
      </footer>
    </div>
  );
}

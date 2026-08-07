import { Button, Card, Container } from '@/components/ui';
import styles from './page.module.css';

const featuredProducts = [
  {
    title: 'Hand-thrown ceramic mug',
    category: 'Home Decor',
    description: 'Warm-toned stoneware with a matte glaze and a comfortable grip.',
  },
  {
    title: 'Woven market tote',
    category: 'Wearables',
    description: 'Durable handmade cotton with natural fibers and reinforced handles.',
  },
  {
    title: 'Beaded gift bracelet',
    category: 'Gift Ideas',
    description: 'A subtle handcrafted accent with a thoughtful presentation box.',
  },
];

const categories = [
  {
    title: 'Home Decor',
    description: 'Ceramics, textiles, wall art, and pieces that make a space feel lived in.',
  },
  {
    title: 'Wearables',
    description: 'Jewelry, bags, scarves, and artisan-made clothing accessories.',
  },
  {
    title: 'Gift Ideas',
    description: 'Small-batch items and one-of-a-kind presents for important moments.',
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <Container>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>WDD 430 Group Project</p>
          <h1>Shop handmade goods from real makers in one place.</h1>
          <p>
            Handcrafted Haven is where shoppers can browse products, compare categories, and connect
            with makers through seller profiles and reviews.
          </p>
          <div className={styles.ctas}>
            <Button href="#featured">Explore Products</Button>
            <Button href="#next" variant="secondary">
              Meet Sellers
            </Button>
          </div>
        </section>
      </Container>

      <Container>
        <section id="featured" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Featured products</p>
              <h2>Featured pieces from local makers.</h2>
            </div>
            <p className={styles.sectionLead}>
              A quick look at the types of handmade products shoppers can find in the marketplace.
            </p>
          </div>

          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <Card as="article" key={product.title} className={styles.productCard}>
                <p className={styles.cardKicker}>{product.category}</p>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </Container>

      <Container>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Categories</p>
              <h2>Easy browsing paths for shoppers.</h2>
            </div>
            <p className={styles.sectionLead}>
              Categories help buyers narrow results before they open full product details.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Card as="article" key={category.title} className={styles.categoryCard}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </Container>

      <Container>
        <section id="why" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Why Handcrafted Haven</p>
              <h2>Built around trust and simple browsing.</h2>
            </div>
          </div>

          <Card className={styles.whyCard}>
            <ul className={styles.whyList}>
              <li>Seller profiles with stories and craftsmanship highlights</li>
              <li>Filterable product listings by category and price</li>
              <li>Community trust through ratings and written reviews</li>
            </ul>
          </Card>
        </section>
      </Container>

      <Container>
        <section id="next" className={styles.ctaSection}>
          <Card className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <div>
                <p className={styles.eyebrow}>Next steps</p>
                <h2>Keep building the marketplace experience.</h2>
              </div>
              <p className={styles.sectionLead}>
                The current layout supports live data, account flows, and seller tools without a full
                page redesign.
              </p>
            </div>

            <div className={styles.ctas}>
              <Button href="/marketplace" variant="secondary">
                Browse marketplace
              </Button>
              <Button href="/register">Create account</Button>
              <Button href="/login" variant="secondary">
                Sign in
              </Button>
              <Button href="/dashboard/seller-profile" variant="ghost">
                Seller profile
              </Button>
            </div>
          </Card>
        </section>
      </Container>
    </main>
  );
}

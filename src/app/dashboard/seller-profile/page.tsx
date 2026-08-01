import { Button, Container } from "@/components/ui";
import { SellerInformation } from "@/components/seller-profile/seller-information";
import { SellerProducts } from "@/components/seller-profile/seller-products";
import styles from "@/components/seller-profile/seller-profile.module.css";

const sellerProfile = {
  storeName: "Arlin's Studio",
  ownerName: "Arlin Parker Jones",
  rating: 4.8,
  bio: "Small-batch handmade items with a focus on simple materials and clean design.",
  location: "Port Harcourt",
  productsCount: 3,
  yearsSelling: 2,
};

const sellerProducts = [
  {
    id: "mug-01",
    title: "Hand-thrown ceramic mug",
    description: "A matte mug shaped for everyday use.",
    price: "$24",
    stock: 8,
    category: "Home Decor",
  },
  {
    id: "tote-01",
    title: "Woven market tote",
    description: "A strong cotton tote for errands and gifts.",
    price: "$32",
    stock: 5,
    category: "Wearables",
  },
  {
    id: "bracelet-01",
    title: "Beaded gift bracelet",
    description: "A small gift item with a clean finish.",
    price: "$18",
    stock: 12,
    category: "Gift Ideas",
  },
];

export default function SellerProfilePage() {
  return (
    <main>
      <Container>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Seller profile page</p>
              <h2 className={styles.sectionTitle}>Current seller profile view</h2>
            </div>
            <p className={styles.sectionText}>
              This page uses sample data for now. It can switch to the backend once
              Eric adds the seller profile API.
            </p>
          </div>

          <SellerInformation seller={sellerProfile} />
        </div>
      </Container>

      <Container>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Seller products</p>
              <h2 className={styles.sectionTitle}>Products listed by this seller</h2>
            </div>
          </div>

          <SellerProducts products={sellerProducts} />
        </div>
      </Container>

      <Container>
        <div className={styles.section}>
          <div className={styles.actionRow}>
            <Button href="/seller-profile/edit">Edit seller profile</Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
import { Container } from "@/components/ui";
import { CreateSellerProfileForm } from "@/components/seller-profile/create-seller-profile-form";
import styles from "@/components/seller-profile/seller-profile.module.css";

export default function CreateSellerProfilePage() {
  return (
    <main>
      <Container size="narrow">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Create seller profile</p>
              <h2 className={styles.sectionTitle}>Set up your store profile</h2>
            </div>
            <p className={styles.sectionText}>
              Add a store name and optional bio. You can update these details later.
            </p>
          </div>

          <CreateSellerProfileForm />
        </div>
      </Container>
    </main>
  );
}
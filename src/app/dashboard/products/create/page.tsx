import { Container } from "@/components/ui";
import { ProductForm } from "@/components/product/product-form";
import styles from "@/components/product/product-pages.module.css";

export default function CreateProductPage() {
  return (
    <main className={styles.page}>
      <Container size="narrow">
        <div className={styles.section}>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Create product</p>
              <h1 className={styles.title}>Add a new product listing</h1>
            </div>
            <p className={styles.lead}>Fill in product details and publish it to your seller profile.</p>
          </div>

          <ProductForm mode="create" />
        </div>
      </Container>
    </main>
  );
}
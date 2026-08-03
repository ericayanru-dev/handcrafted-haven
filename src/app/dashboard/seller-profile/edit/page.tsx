"use client";

import { useState } from "react";
import { Button, Card, Container } from "@/components/ui";
import styles from "@/components/seller-profile/seller-profile.module.css";

const initialForm = {
  storeName: "Arlin's Studio",
  bio: "Small-batch handmade items with a focus on simple materials and clean design.",
  location: "Port Harcourt",
};

export default function EditSellerProfilePage() {
  const [form, setForm] = useState(initialForm);
  const [savedMessage, setSavedMessage] = useState("");

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedMessage("This form is ready, but it still needs a backend endpoint to save changes.");
  }

  return (
    <main>
      <Container size="narrow">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Edit seller profile</p>
              <h2 className={styles.sectionTitle}>Update profile details</h2>
            </div>
            <p className={styles.sectionText}>
              The form is built on the frontend. Saving still depends on Eric wiring the API.
            </p>
          </div>

          <Card>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.fieldGroup} htmlFor="storeName">
                <span className={styles.fieldLabel}>Store name</span>
                <input
                  className={styles.field}
                  id="storeName"
                  name="storeName"
                  onChange={(event) => updateField("storeName", event.target.value)}
                  value={form.storeName}
                />
              </label>

              <label className={styles.fieldGroup} htmlFor="location">
                <span className={styles.fieldLabel}>Location</span>
                <input
                  className={styles.field}
                  id="location"
                  name="location"
                  onChange={(event) => updateField("location", event.target.value)}
                  value={form.location}
                />
              </label>

              <label className={styles.fieldGroup} htmlFor="bio">
                <span className={styles.fieldLabel}>Bio</span>
                <textarea
                  className={styles.textarea}
                  id="bio"
                  name="bio"
                  onChange={(event) => updateField("bio", event.target.value)}
                  value={form.bio}
                />
              </label>

              <p className={styles.hint}>
                This is the edit screen shell. Once the backend exists, this form can
                send the updated seller profile data.
              </p>

              {savedMessage ? <p className={styles.hint}>{savedMessage}</p> : null}

              <div className={styles.actionRow}>
                <Button type="submit">Save changes</Button>
                <Button href="/seller-profile" variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}
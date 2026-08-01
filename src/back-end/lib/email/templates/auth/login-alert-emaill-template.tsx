// src/lib/email/templates/login-alert.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LoginAlertProps {
  firstName: string;
  location: string;
  device: string;
  time: string;
  ipAddress?: string;
  securityUrl?: string;
}

export default function LoginAlertEmail({
  firstName = "there",
  location = "Unknown Location",
  device = "Unknown Device",
  time = "just now",
  ipAddress = "Unknown IP",
  securityUrl = "https://Handcrafted.com/security",
}: LoginAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>New login detected on your Handcrafted Haven account</Preview>

      <Body
        style={{
          backgroundColor: "#f8f9fa",
          color: "#212529",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "40px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Logo */}
          <Section style={{ textAlign: "center", marginBottom: "30px" }}>
            <Img
              src="https://yourdomain.com/logo.png"
              width="180"
              alt="Autmint Logo"
              style={{ margin: "0 auto", display: "block" }}
            />
          </Section>

          <Heading
            style={{
              color: "#dc3545",
              fontSize: "32px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            New Login Detected
          </Heading>

          <Text
            style={{
              fontSize: "18px",
              color: "#495057",
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            Hello {firstName},
          </Text>

          {/* Alert Box */}
          <Section
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "12px",
              padding: "35px",
              marginBottom: "30px",
            }}
          >
            <Text
              style={{
                color: "#856404",
                fontSize: "17px",
                lineHeight: "1.7",
                marginBottom: "25px",
                textAlign: "center",
              }}
            >
              We detected a new login to your Handcrafted Haven account from a different location or
              device.
            </Text>

            <Section
              style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ marginBottom: "12px" }}>
                <strong>Device:</strong> {device}
              </Text>
              <Text style={{ marginBottom: "12px" }}>
                <strong>Location:</strong> {location}
              </Text>
              <Text style={{ marginBottom: "12px" }}>
                <strong>Time:</strong> {time}
              </Text>
              {ipAddress && (
                <Text>
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
              )}
            </Section>

            <Button
              href={securityUrl}
              style={{
                backgroundColor: "#ffc107",
                color: "#000000",
                fontSize: "17px",
                fontWeight: "600",
                padding: "15px 35px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-block",
                textAlign: "center",
                margin: "10px 0",
              }}
            >
              Review Security Settings
            </Button>
          </Section>

          {/* Warning */}
          <Section
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              padding: "25px",
              marginBottom: "30px",
            }}
          >
            <Text
              style={{
                color: "#721c24",
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              <strong>If this wasn&apos;t you:</strong> Please change your password immediately and
              enable 2FA for extra security.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#dee2e6", margin: "35px 0" }} />

          {/* Footer */}
          <Text
            style={{
              textAlign: "center",
              color: "#6c757d",
              fontSize: "14px",
            }}
          >
            This is an automated security alert from Handcrafted Haven.
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: "#6c757d",
              fontSize: "12px",
              marginTop: "20px",
            }}
          >
            © {new Date().getFullYear()} Handcrafted Haven. All rights reserved.
            <br />
            Port Harcourt, World
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

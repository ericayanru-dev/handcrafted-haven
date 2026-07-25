// src/lib/email/templates/reset-password.tsx
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

interface ResetPasswordProps {
  firstName: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  firstName = "there",
  resetUrl,
}: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Handcrafted Haven password</Preview>

      <Body style={{ 
        backgroundColor: "#f8f9fa", 
        color: "#212529", 
        fontFamily: "Arial, sans-serif", 
        margin: 0, 
        padding: 0 
      }}>
        <Container style={{ 
          maxWidth: "600px", 
          margin: "0 auto", 
          padding: "40px 20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>

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
              color: "#212529", 
              fontSize: "32px", 
              fontWeight: "bold", 
              textAlign: "center", 
              marginBottom: "20px" 
            }}
          >
            Reset Your Password
          </Heading>

          <Text style={{ 
            fontSize: "18px", 
            color: "#495057", 
            textAlign: "center", 
            marginBottom: "30px" 
          }}>
            Hello {firstName},
          </Text>

          {/* Main Content Box */}
          <Section style={{ 
            backgroundColor: "#f8f9fa", 
            borderRadius: "12px", 
            padding: "40px 30px", 
            border: "1px solid #e9ecef", 
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <Text style={{ 
              color: "#212529", 
              fontSize: "17px", 
              lineHeight: "1.7",
              marginBottom: "30px" 
            }}>
              You requested to reset your password for your Handcrafted Haven account.
              Click the button below to choose a new password.
            </Text>

            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#ffc107",
                color: "#000000",
                fontSize: "18px",
                fontWeight: "600",
                padding: "16px 40px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-block",
                textAlign: "center",
                margin: "10px 0",
                boxShadow: "0 4px 8px rgba(255, 193, 7, 0.3)"
              }}
            >
              Reset My Password
            </Button>

            <Text style={{ 
              color: "#dc3545", 
              fontSize: "15px", 
              marginTop: "25px" 
            }}>
              This link expires in 30 minutes for security reasons.
            </Text>
          </Section>

          <Text style={{ 
            color: "#6c757d", 
            fontSize: "15px", 
            textAlign: "center", 
            marginBottom: "25px" 
          }}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
          </Text>

          <Hr style={{ borderColor: "#dee2e6", margin: "35px 0" }} />

          {/* Footer */}
          <Text style={{ 
            textAlign: "center", 
            color: "#6c757d", 
            fontSize: "14px" 
          }}>
            Need help? Just reply to this email.
          </Text>

          <Text style={{ 
            textAlign: "center", 
            color: "#6c757d", 
            fontSize: "12px", 
            marginTop: "20px" 
          }}>
            © {new Date().getFullYear()} Handcrafted Haven. All rights reserved.
            <br />
            Port Harcourt, World
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
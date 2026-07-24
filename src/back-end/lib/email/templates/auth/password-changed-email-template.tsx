// src/lib/email/templates/password-changed.tsx
import {
  Body,
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

interface PasswordChangedProps {
  firstName: string;
}

export default function PasswordChangedEmail({
  firstName = "there",
}: PasswordChangedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Handcrafted Haven password has been successfully changed</Preview>

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
            Password Changed Successfully
          </Heading>

          <Text style={{ 
            fontSize: "18px", 
            color: "#495057", 
            textAlign: "center", 
            marginBottom: "30px" 
          }}>
            Hello {firstName},
          </Text>

          {/* Success Card */}
          <Section style={{ 
            backgroundColor: "#f8f9fa", 
            borderRadius: "12px", 
            padding: "40px 30px", 
            border: "1px solid #e9ecef", 
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <Text style={{ 
              color: "#28a745", 
              fontSize: "48px", 
              marginBottom: "20px" 
            }}>
              ✓
            </Text>

            <Text style={{ 
              color: "#212529", 
              fontSize: "20px", 
              fontWeight: "600",
              marginBottom: "15px" 
            }}>
              Your password has been updated
            </Text>

            <Text style={{ 
              color: "#495057", 
              fontSize: "17px", 
              lineHeight: "1.6" 
            }}>
              Your Handcrafted Haven account password was successfully changed.
            </Text>
          </Section>

          {/* Security Notice */}
          <Section style={{ 
            backgroundColor: "#fff3cd", 
            borderRadius: "8px", 
            padding: "20px", 
            border: "1px solid #ffeaa7",
            marginBottom: "30px"
          }}>
            <Text style={{ 
              color: "#856404", 
              fontSize: "15px", 
              textAlign: "center" 
            }}>
              <strong>Security Notice:</strong> If you did not make this change, 
              please contact support immediately as your account may be compromised.
            </Text>
          </Section>

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
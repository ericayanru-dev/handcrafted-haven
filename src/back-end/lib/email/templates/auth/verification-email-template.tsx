// src/lib/email/templates/verify-email.tsx
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

interface VerifyEmailProps {
  firstName: string;
  verifyUrl: string;
  code?: string;           // Optional OTP code
}

export default function VerifyEmail({
  firstName = "there",
  verifyUrl,
  code,
}: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Handcrafted Haven account - Complete your registration</Preview>

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
            Verify Your Email
          </Heading>

          <Text style={{ 
            fontSize: "18px", 
            color: "#495057", 
            textAlign: "center", 
            marginBottom: "30px" 
          }}>
            Hello {firstName},<br />
            Thank you for signing up to Handcrafted Haven.
          </Text>

          {/* Main Verification Box */}
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
              marginBottom: "25px" 
            }}>
              Please verify your email address to activate your account and start receiving trading signals.
            </Text>

            {/* OTP Code (if provided) */}
            {code && (
              <Section style={{ 
                backgroundColor: "#ffffff", 
                padding: "20px", 
                borderRadius: "10px", 
                marginBottom: "25px",
                border: "2px solid #ffc107"
              }}>
                <Text style={{ 
                  fontSize: "32px", 
                  fontWeight: "bold", 
                  letterSpacing: "8px", 
                  color: "#212529",
                  margin: "0"
                }}>
                  {code}
                </Text>
                <Text style={{ fontSize: "14px", color: "#6c757d", marginTop: "8px" }}>
                  This code expires in 30 minutes
                </Text>
              </Section>
            )}

            {/* Verify Button */}
            <Button
              href={verifyUrl}
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
              Verify My Email Address
            </Button>
          </Section>

          <Text style={{ 
            color: "#6c757d", 
            fontSize: "15px", 
            textAlign: "center", 
            marginBottom: "30px" 
          }}>
            If you didn&apos;t create an account with Handcrafted Haven, you can safely ignore this email.
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
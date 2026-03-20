import React from "react";
import { Button, Section } from "@react-email/components";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <Button
        href={href}
        style={{
          backgroundColor: "#c96a0c",
          color: "#ffffff",
          padding: "12px 28px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

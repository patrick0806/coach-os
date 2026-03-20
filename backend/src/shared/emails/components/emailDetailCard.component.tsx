import React from "react";
import { Section, Row, Column, Text } from "@react-email/components";

export interface DetailRow {
  label: string;
  value: string;
}

interface EmailDetailCardProps {
  rows: DetailRow[];
}

export function EmailDetailCard({ rows }: EmailDetailCardProps) {
  return (
    <Section
      style={{
        backgroundColor: "#f5f0eb",
        borderRadius: "8px",
        padding: "16px 20px",
        margin: "20px 0",
      }}
    >
      {rows.map((row, index) => (
        <Row key={index} style={{ marginBottom: index < rows.length - 1 ? "8px" : "0" }}>
          <Column style={{ width: "130px", verticalAlign: "top" }}>
            <Text style={{ fontSize: "14px", color: "#78716c", fontWeight: "500", margin: "0" }}>
              {row.label}
            </Text>
          </Column>
          <Column>
            <Text style={{ fontSize: "14px", color: "#1c1917", fontWeight: "600", margin: "0" }}>
              {row.value}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

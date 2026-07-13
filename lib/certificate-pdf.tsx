import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0A1535",
    color: "#FFFFFF",
    padding: 56,
    fontFamily: "Helvetica",
  },
  border: {
    borderWidth: 2,
    borderColor: "#C9A227",
    padding: 40,
    height: "100%",
  },
  overline: {
    fontSize: 11,
    color: "#F5C842",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 18,
    textAlign: "center",
  },
  title: {
    fontSize: 30,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  tier: {
    fontSize: 16,
    color: "#F5C842",
    textAlign: "center",
    marginBottom: 32,
  },
  line: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 6,
  },
  holder: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 14,
  },
  course: {
    fontSize: 15,
    color: "#F5C842",
    textAlign: "center",
    marginBottom: 36,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  footerLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  footerValue: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});

type CertificateData = {
  serial: string;
  tier: "COMPLETION" | "DISTINCTION" | "BUSINESS";
  issuedAt: Date;
  holderName: string;
  courseTitle?: string | null;
  sector?: string | null;
};

const TIER_LABEL: Record<CertificateData["tier"], string> = {
  DISTINCTION: "Certificate of Distinction",
  COMPLETION: "Certificate of Completion",
  BUSINESS: "Halal Certification",
};

function CertificateDocument({ serial, tier, issuedAt, holderName, courseTitle, sector }: CertificateData) {
  const tierLabel = TIER_LABEL[tier];
  const isBusiness = tier === "BUSINESS";
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.overline}>Dar Al Halal Certification</Text>
          <Text style={styles.title}>{tierLabel}</Text>
          <Text style={styles.tier}>
            {isBusiness ? "Certified Halal Compliant" : tier === "DISTINCTION" ? "Awarded with Distinction" : "Successfully Completed"}
          </Text>
          <Text style={styles.line}>This certifies that</Text>
          <Text style={styles.holder}>{holderName}</Text>
          <Text style={styles.line}>{isBusiness ? "has met halal compliance standards in the sector of" : "has successfully completed the course"}</Text>
          <Text style={styles.course}>{isBusiness ? sector : courseTitle}</Text>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Serial Number</Text>
              <Text style={styles.footerValue}>{serial}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>Issued</Text>
              <Text style={styles.footerValue}>{issuedAt.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>Verify at</Text>
              <Text style={styles.footerValue}>daralhalalcertification.com/verify</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument {...data} />);
}

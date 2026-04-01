import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export type EstimatePdfLine = {
  description: string;
  qty: string;
  unit: string;
  amount: string;
};

export type EstimatePdfData = {
  docTitle: string;
  estimateNoLabel: string;
  dateLabel: string;
  validUntilLabelText: string;
  amountLabel: string;
  estimateNumber: string;
  issueDateLabel: string;
  validUntilLabel: string | null;
  status: string;
  fromName: string;
  fromAddress: string | null;
  fromEmail: string | null;
  fromPhone: string | null;
  fromNotes: string | null;
  clientName: string;
  clientCompany: string | null;
  clientAddress: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  lines: EstimatePdfLine[];
  subtotal: string;
  taxLabel: string;
  tax: string;
  total: string;
  amount: string;
  notes: string | null;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 46,
    paddingHorizontal: 46,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1c1917",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandName: { fontSize: 13.5, fontWeight: "bold", marginBottom: 4 },
  brandLine: { fontSize: 9.5, color: "#44403c", lineHeight: 1.35 },
  rightTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    textAlign: "right",
    letterSpacing: 0.3,
  },
  metaGrid: { marginTop: 10, gap: 6 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 18 },
  metaLabel: { fontSize: 7.8, color: "#78716c", letterSpacing: 0.4 },
  metaValue: { fontSize: 9.5, color: "#1c1917", textAlign: "right" },
  amountBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
  },
  amountLabel: {
    fontSize: 7.8,
    color: "#78716c",
    letterSpacing: 0.4,
    textAlign: "right",
  },
  amountValue: { marginTop: 4, fontSize: 13.5, fontWeight: "bold", textAlign: "right" },
  sectionLabel: { fontSize: 7.8, color: "#78716c", letterSpacing: 0.4, marginBottom: 6 },
  body: { fontSize: 9.5, color: "#1c1917", lineHeight: 1.35 },
  billToBlock: { marginBottom: 18 },
  billToLine: { marginTop: 2, color: "#44403c" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.2,
    borderBottomColor: "#d6d3d1",
    paddingBottom: 8,
    marginTop: 8,
  },
  th: { fontSize: 7.8, color: "#78716c", fontWeight: "bold", letterSpacing: 0.2 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    borderBottomWidth: 0.6,
    borderBottomColor: "#e7e5e4",
  },
  td: { fontSize: 9.5, color: "#1c1917" },
  colDesc: { width: "56%" },
  colQty: { width: "10%", textAlign: "right" },
  colPrice: { width: "17%", textAlign: "right" },
  colAmt: { width: "17%", textAlign: "right" },
  totals: { marginTop: 18, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginBottom: 6,
    fontSize: 9.5,
    color: "#44403c",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1.2,
    borderTopColor: "#d6d3d1",
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#1c1917",
  },
  lowerSections: { marginTop: 22, gap: 16 },
  lowerBlock: { paddingTop: 12, borderTopWidth: 0.6, borderTopColor: "#e7e5e4" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 46,
    right: 46,
    fontSize: 7.5,
    color: "#a8a29e",
    textAlign: "center",
  },
});

export function EstimatePdfDocument({ data }: { data: EstimatePdfData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ maxWidth: 320 }}>
            <Text style={styles.brandName}>{data.fromName}</Text>
            {data.fromAddress ? (
              <Text style={styles.brandLine}>{data.fromAddress}</Text>
            ) : null}
            <Text style={styles.brandLine}>
              {[data.fromPhone, data.fromEmail].filter(Boolean).join(" • ")}
            </Text>
          </View>
          <View style={{ width: 220 }}>
            <Text style={styles.rightTitle}>{data.docTitle}</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{data.estimateNoLabel}</Text>
                <Text style={styles.metaValue}>{data.estimateNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{data.dateLabel}</Text>
                <Text style={styles.metaValue}>{data.issueDateLabel}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{data.validUntilLabelText}</Text>
                <Text style={styles.metaValue}>{data.validUntilLabel ?? "—"}</Text>
              </View>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>{data.amountLabel}</Text>
              <Text style={styles.amountValue}>{data.amount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.billToBlock}>
          <Text style={styles.sectionLabel}>BILL TO</Text>
          <Text style={[styles.body, { fontWeight: "bold" }]}>
            {data.clientCompany ? `${data.clientName} / ${data.clientCompany}` : data.clientName}
          </Text>
          {data.clientAddress ? (
            <Text style={[styles.body, styles.billToLine]}>{data.clientAddress}</Text>
          ) : null}
          <Text style={[styles.body, styles.billToLine]}>
            {[data.clientEmail, data.clientPhone].filter(Boolean).join(" • ")}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colPrice]}>Rate</Text>
          <Text style={[styles.th, styles.colAmt]}>Amount</Text>
        </View>
        {data.lines.map((line, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={[styles.td, styles.colDesc]}>{line.description}</Text>
            <Text style={[styles.td, styles.colQty]}>{line.qty}</Text>
            <Text style={[styles.td, styles.colPrice]}>{line.unit}</Text>
            <Text style={[styles.td, styles.colAmt]}>{line.amount}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{data.subtotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>{data.taxLabel}</Text>
            <Text>{data.tax}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>TOTAL</Text>
            <Text>{data.total}</Text>
          </View>
        </View>

        <View style={styles.lowerSections}>
          {data.fromNotes ? (
            <View style={styles.lowerBlock}>
              <Text style={styles.sectionLabel}>PAYMENT INFORMATION</Text>
              <Text style={styles.body}>{data.fromNotes}</Text>
            </View>
          ) : null}
          {data.notes ? (
            <View style={styles.lowerBlock}>
              <Text style={styles.sectionLabel}>NOTES</Text>
              <Text style={styles.body}>{data.notes}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footer} fixed>
          -- 1 of 1 --
        </Text>
      </Page>
    </Document>
  );
}

export async function renderEstimatePdfBuffer(data: EstimatePdfData): Promise<Buffer> {
  return renderToBuffer(<EstimatePdfDocument data={data} />);
}

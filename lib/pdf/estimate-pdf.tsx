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
  estimateNumber: string;
  issueDateLabel: string;
  validUntilLabel: string | null;
  status: string;
  fromName: string;
  fromTagline: string;
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
  notes: string | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1c1917",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
  },
  docKind: {
    fontSize: 8,
    color: "#78716c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  docNumber: { fontSize: 16, fontWeight: "bold" },
  dateBlock: { fontSize: 9, color: "#44403c", textAlign: "right" },
  twoCol: { flexDirection: "row", gap: 24, marginBottom: 20 },
  col: { flex: 1 },
  sectionLabel: {
    fontSize: 7,
    color: "#78716c",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  body: { fontSize: 9, color: "#292524", lineHeight: 1.4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d6d3d1",
    paddingBottom: 6,
    marginTop: 8,
  },
  th: { fontSize: 7, color: "#78716c", fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e7e5e4",
  },
  td: { fontSize: 9, color: "#292524" },
  colDesc: { width: "42%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "21%", textAlign: "right" },
  colAmt: { width: "25%", textAlign: "right", fontWeight: "bold" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
    fontSize: 9,
    color: "#57534e",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d6d3d1",
    fontSize: 11,
    fontWeight: "bold",
    color: "#1c1917",
  },
  notesBlock: { marginTop: 20, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: "#e7e5e4" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 7,
    color: "#a8a29e",
    textAlign: "center",
  },
});

export function EstimatePdfDocument({ data }: { data: EstimatePdfData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.docKind}>Estimate</Text>
            <Text style={styles.docNumber}>{data.estimateNumber}</Text>
            <Text style={[styles.body, { marginTop: 4, color: "#78716c" }]}>
              Status: {data.status}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text>Issued: {data.issueDateLabel}</Text>
            {data.validUntilLabel ? (
              <Text style={{ marginTop: 4 }}>Valid until: {data.validUntilLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Prepared for</Text>
            <Text style={[styles.body, { fontWeight: "bold" }]}>{data.clientName}</Text>
            {data.clientCompany ? (
              <Text style={styles.body}>{data.clientCompany}</Text>
            ) : null}
            {data.clientAddress ? (
              <Text style={[styles.body, { marginTop: 4 }]}>{data.clientAddress}</Text>
            ) : null}
            {data.clientEmail ? (
              <Text style={[styles.body, { marginTop: 4 }]}>{data.clientEmail}</Text>
            ) : null}
            {data.clientPhone ? <Text style={styles.body}>{data.clientPhone}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>From</Text>
            <Text style={[styles.body, { fontWeight: "bold" }]}>{data.fromName}</Text>
            <Text style={styles.body}>{data.fromTagline}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colPrice]}>Price</Text>
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
          <View style={styles.grandTotal}>
            <Text>Estimated total</Text>
            <Text>{data.total}</Text>
          </View>
        </View>

        {data.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.body}>{data.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          Generated by {data.fromName} — This is an estimate, not an invoice.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderEstimatePdfBuffer(data: EstimatePdfData): Promise<Buffer> {
  return renderToBuffer(<EstimatePdfDocument data={data} />);
}

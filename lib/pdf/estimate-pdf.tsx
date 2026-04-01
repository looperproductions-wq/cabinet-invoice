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
    paddingTop: 0,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1c1917",
  },
  navy: { color: "#152643" },
  headerBand: {
    backgroundColor: "#152643",
    paddingTop: 34,
    paddingBottom: 22,
    paddingHorizontal: 40,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerCompany: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  headerSmall: { marginTop: 6, fontSize: 9, color: "#dbe6ff", lineHeight: 1.35 },
  headerTitle: { fontSize: 30, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.6 },
  accentLine: { height: 4, backgroundColor: "#3b82f6" },

  content: { marginTop: 18 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
  },
  metaCell: { flex: 1 },
  metaLabel: { fontSize: 7, color: "#6b7280", fontWeight: "bold", letterSpacing: 0.4 },
  metaValue: { marginTop: 6, fontSize: 10, fontWeight: "bold", color: "#111827" },
  metaValueBig: { marginTop: 6, fontSize: 11, fontWeight: "bold", color: "#111827" },

  sectionLabel: { marginTop: 18, fontSize: 7, color: "#6b7280", fontWeight: "bold", letterSpacing: 0.4 },
  body: { fontSize: 9.2, color: "#111827", lineHeight: 1.35 },
  billToName: { marginTop: 6, fontSize: 11, fontWeight: "bold", color: "#111827" },
  billToLine: { marginTop: 2, color: "#6b7280" },

  tableWrap: { marginTop: 16, borderWidth: 0, borderColor: "#e5e7eb" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#152643",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: { fontSize: 8, color: "#ffffff", fontWeight: "bold", letterSpacing: 0.3 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  td: { fontSize: 9.2, color: "#111827" },
  tdMuted: { color: "#6b7280" },
  colDesc: { width: "55%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "17%", textAlign: "right" },
  colAmt: { width: "18%", textAlign: "right", fontWeight: "bold" },

  totals: { marginTop: 8, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 240,
    marginTop: 10,
    fontSize: 9.2,
    color: "#6b7280",
  },
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 240,
    marginTop: 12,
    backgroundColor: "#152643",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  totalBarLabel: { fontSize: 10, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.4 },
  totalBarValue: { fontSize: 12, fontWeight: "bold", color: "#ffffff" },

  bottomRow: { flexDirection: "row", gap: 28, marginTop: 28 },
  bottomCol: { flex: 1 },
  bottomLabel: { fontSize: 7, color: "#6b7280", fontWeight: "bold", letterSpacing: 0.4 },
  bottomText: { marginTop: 6, fontSize: 9.2, color: "#111827", lineHeight: 1.4 },

  footerRule: { marginTop: 34, borderTopWidth: 1, borderTopColor: "#e7e5e4" },
  footer: {
    marginTop: 12,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
});

export function EstimatePdfDocument({ data }: { data: EstimatePdfData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerRow}>
            <View style={{ maxWidth: 360 }}>
              <Text style={styles.headerCompany}>{data.fromName.toUpperCase()}</Text>
              {data.fromAddress ? (
                <Text style={styles.headerSmall}>{data.fromAddress}</Text>
              ) : null}
              <Text style={styles.headerSmall}>
                {[
                  data.fromAddress ? null : null,
                  [data.fromPhone, data.fromEmail].filter(Boolean).join(" • "),
                ]
                  .filter(Boolean)
                  .join("")}
              </Text>
            </View>
            <Text style={styles.headerTitle}>{data.docTitle.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.accentLine} />

        <View style={[styles.content, { paddingHorizontal: 2 }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>{data.estimateNoLabel}</Text>
              <Text style={styles.metaValue}>{data.estimateNumber}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>{data.dateLabel}</Text>
              <Text style={styles.metaValue}>{data.issueDateLabel}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>{data.validUntilLabelText}</Text>
              <Text style={styles.metaValue}>{data.validUntilLabel ?? "—"}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>{data.amountLabel}</Text>
              <Text style={styles.metaValueBig}>{data.amount}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>BILL TO</Text>
          <Text style={styles.billToName}>
            {data.clientCompany ? `${data.clientName} / ${data.clientCompany}` : data.clientName}
          </Text>
          {data.clientAddress ? (
            <Text style={[styles.body, styles.billToLine]}>{data.clientAddress}</Text>
          ) : null}
          <Text style={[styles.body, styles.billToLine]}>
            {[data.clientEmail, data.clientPhone].filter(Boolean).join(" • ")}
          </Text>

          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colDesc]}>DESCRIPTION</Text>
              <Text style={[styles.th, styles.colQty]}>QTY</Text>
              <Text style={[styles.th, styles.colPrice]}>RATE</Text>
              <Text style={[styles.th, styles.colAmt]}>AMOUNT</Text>
            </View>
            {data.lines.map((line, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  { backgroundColor: i % 2 === 0 ? "#f3f4f6" : "#ffffff" },
                ]}
                wrap={false}
              >
                <Text style={[styles.td, styles.colDesc]}>{line.description}</Text>
                <Text style={[styles.td, styles.colQty, styles.tdMuted]}>{line.qty}</Text>
                <Text style={[styles.td, styles.colPrice, styles.tdMuted]}>{line.unit}</Text>
                <Text style={[styles.td, styles.colAmt]}>{line.amount}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{data.subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>{data.taxLabel}</Text>
              <Text>{data.tax}</Text>
            </View>
            <View style={styles.totalBar}>
              <Text style={styles.totalBarLabel}>TOTAL</Text>
              <Text style={styles.totalBarValue}>{data.total}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            {data.fromNotes ? (
              <View style={styles.bottomCol}>
                <Text style={styles.bottomLabel}>PAYMENT INFORMATION</Text>
                <Text style={styles.bottomText}>{data.fromNotes}</Text>
              </View>
            ) : (
              <View style={styles.bottomCol} />
            )}
            {data.notes ? (
              <View style={styles.bottomCol}>
                <Text style={styles.bottomLabel}>NOTES</Text>
                <Text style={styles.bottomText}>{data.notes}</Text>
              </View>
            ) : (
              <View style={styles.bottomCol} />
            )}
          </View>

          <View style={styles.footerRule} />
          <Text style={styles.footer}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderEstimatePdfBuffer(data: EstimatePdfData): Promise<Buffer> {
  return renderToBuffer(<EstimatePdfDocument data={data} />);
}

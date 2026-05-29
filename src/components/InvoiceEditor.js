import React, { useState } from "react";

// ─── Inline Editable Field ────────────────────────────────────────────────────
function EditableField({ value, onChange, style = {}, multiline = false, align = "left" }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    const inputStyle = {
      font: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "inherit", textAlign: align, border: "1.5px solid #1a73e8",
      borderRadius: "3px", padding: "1px 4px", outline: "none",
      background: "#f0f7ff", width: multiline ? "100%" : "auto",
      minWidth: "60px", boxSizing: "border-box", ...style,
    };
    if (multiline) {
      return (
        <textarea
          autoFocus
          style={{ ...inputStyle, resize: "vertical", minHeight: "50px" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      );
    }
    return (
      <input
        autoFocus
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
      />
    );
  }

  return (
    <span
      title="Click to edit"
      style={{
        cursor: "pointer", borderBottom: "1px dashed transparent",
        minWidth: "40px", display: "inline-block", textAlign: align, ...style,
      }}
      onClick={() => setEditing(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderBottom = "1px dashed #1a73e8";
        e.currentTarget.style.backgroundColor = "#f0f7ff";
        e.currentTarget.style.borderRadius = "2px";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderBottom = "1px dashed transparent";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {value || <span style={{ color: "#aaa", fontStyle: "italic" }}>click to edit</span>}
    </span>
  );
}

// ─── InvoiceEditor ────────────────────────────────────────────────────────────
export default function InvoiceEditor({ data, setData }) {
  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const setItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      const qty = field === "quantity" ? parseFloat(value) : parseFloat(items[index].quantity);
      const rate = field === "rate" ? parseFloat(value) : parseFloat(items[index].rate);
      items[index].amount = isNaN(qty * rate) ? 0 : parseFloat((qty * rate).toFixed(2));
    }
    setData((prev) => ({ ...prev, items }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, {
        slNo: prev.items.length + 1, description: "", hsn: "",
        gstRate: 18, quantity: 0, unit: "MT", rate: 0, per: "MTS", amount: 0,
      }],
    }));
  };

  const removeItem = (index) => {
    if (data.items.length === 1) return;
    setData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // Calculations
  const totalTaxableValue = data.items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const totalQty = data.items.reduce((s, i) => s + parseFloat(i.quantity || 0), 0);
  const totalTax = data.items.reduce((s, i) => s + (parseFloat(i.amount || 0) * parseFloat(i.gstRate || 0)) / 100, 0);
  const grandTotal = totalTaxableValue + totalTax;
  const gstRate = data.items[0]?.gstRate || 18;

  const S = {
    page: { background: "#e8e8e8", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" },
    hint: { fontSize: "12px", color: "#555", background: "#fff3cd", padding: "6px 14px", borderRadius: "20px", border: "1px solid #ffc107", display: "inline-block", marginBottom: "12px" },
    taxSelect: { padding: "6px 10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "12px", marginBottom: "12px", marginLeft: "10px" },
    box: { maxWidth: "900px", margin: "0 auto", background: "white", border: "1px solid #000", fontSize: "11px" },
    title: { textAlign: "center", fontWeight: "bold", fontSize: "15px", padding: "6px", borderBottom: "1px solid #000" },
    table: { width: "100%", borderCollapse: "collapse" },
    td: { border: "1px solid #000", padding: "4px 6px", verticalAlign: "top" },
    tdNB: { padding: "3px 6px", verticalAlign: "top" },
    th: { border: "1px solid #000", padding: "4px 6px", background: "#f5f5f5", fontWeight: "bold", textAlign: "center" },
    bold: { fontWeight: "bold" },
    small: { fontSize: "10px" },
    addBtn: { background: "#34a853", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", margin: "4px" },
    delBtn: { background: "#ea4335", color: "white", border: "none", padding: "2px 6px", borderRadius: "3px", cursor: "pointer", fontSize: "10px" },
  };

  return (
    <div style={S.page}>
      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "8px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={S.hint}>✏️ Click any field on the invoice to edit it</span>
        <select style={S.taxSelect} value={data.taxType} onChange={(e) => set("taxType", e.target.value)}>
          <option value="IGST">IGST (Inter-state)</option>
          <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
        </select>
      </div>

      <div style={S.box}>
        <div style={S.title}>Tax Invoice</div>

        {/* Seller + Invoice Info */}
        <table style={S.table}><tbody>
          <tr>
            <td style={{ ...S.td, width: "50%" }}>
              <div style={S.bold}><EditableField value={data.sellerName} onChange={(v) => set("sellerName", v)} style={{ fontWeight: "bold", fontSize: "12px" }} /></div>
              <div><EditableField value={data.sellerAddress} onChange={(v) => set("sellerAddress", v)} /></div>
              <div><EditableField value={data.sellerDistrict} onChange={(v) => set("sellerDistrict", v)} /></div>
              <div>State Name: <EditableField value={data.sellerState} onChange={(v) => set("sellerState", v)} /> &nbsp; Code: <EditableField value={data.sellerStateCode} onChange={(v) => set("sellerStateCode", v)} /></div>
              <div style={S.bold}>GSTIN/UIN: <EditableField value={data.sellerGSTIN} onChange={(v) => set("sellerGSTIN", v)} /></div>
            </td>
            <td style={{ ...S.td, width: "50%" }}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Invoice No.</td>
                  <td style={S.tdNB}><b><EditableField value={data.invoiceNo} onChange={(v) => set("invoiceNo", v)} /></b></td>
                  <td style={S.tdNB}>Dated</td>
                  <td style={S.tdNB}><b><EditableField value={data.invoiceDate} onChange={(v) => set("invoiceDate", v)} /></b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Delivery Note</td>
                  <td style={S.tdNB}><EditableField value={data.deliveryNote} onChange={(v) => set("deliveryNote", v)} /></td>
                  <td style={S.tdNB}>Mode/Terms of Payment</td>
                  <td style={S.tdNB}><EditableField value={data.modeOfPayment} onChange={(v) => set("modeOfPayment", v)} /></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Supplier's Ref.</td>
                  <td style={S.tdNB}><EditableField value={data.supplierRef} onChange={(v) => set("supplierRef", v)} /></td>
                  <td style={S.tdNB}>Other Reference(s)</td>
                  <td style={S.tdNB}><EditableField value={data.otherRef} onChange={(v) => set("otherRef", v)} /></td>
                </tr>
              </tbody></table>
            </td>
          </tr>

          {/* Bill To + Order Info */}
          <tr>
            <td style={S.td}>
              <div style={S.bold}>Bill To:-</div>
              <div style={S.bold}><EditableField value={data.buyerName} onChange={(v) => set("buyerName", v)} /></div>
              <div><EditableField value={data.buyerAddress} onChange={(v) => set("buyerAddress", v)} /></div>
              <div><EditableField value={data.buyerCity} onChange={(v) => set("buyerCity", v)} /></div>
              <div>State Name- <EditableField value={data.buyerState} onChange={(v) => set("buyerState", v)} /> &nbsp; Code: <EditableField value={data.buyerStateCode} onChange={(v) => set("buyerStateCode", v)} /></div>
              <div style={S.bold}>GSTIN/UIN: <EditableField value={data.buyerGSTIN} onChange={(v) => set("buyerGSTIN", v)} /></div>
            </td>
            <td style={S.td}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Buyer's Order No.</td>
                  <td style={S.tdNB}><EditableField value={data.buyerOrderNo} onChange={(v) => set("buyerOrderNo", v)} /></td>
                  <td style={S.tdNB}>Dated</td>
                  <td style={S.tdNB}><EditableField value={data.buyerOrderDate} onChange={(v) => set("buyerOrderDate", v)} /></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Despatch Document No.</td>
                  <td style={S.tdNB}><EditableField value={data.despatchDocNo} onChange={(v) => set("despatchDocNo", v)} /></td>
                  <td style={S.tdNB}>Delivery Note Date</td>
                  <td style={S.tdNB}><EditableField value={data.deliveryNoteDate} onChange={(v) => set("deliveryNoteDate", v)} /></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Despatched through</td>
                  <td style={S.tdNB} colSpan={3}><b><EditableField value={data.despatchThrough} onChange={(v) => set("despatchThrough", v)} /></b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Destination</td>
                  <td style={S.tdNB} colSpan={3}><EditableField value={data.destination} onChange={(v) => set("destination", v)} /></td>
                </tr>
              </tbody></table>
            </td>
          </tr>

          {/* Ship To + Vehicle */}
          <tr>
            <td style={S.td}>
              <div style={S.bold}>Ship To:-</div>
              <div style={S.bold}><EditableField value={data.shipToName} onChange={(v) => set("shipToName", v)} /></div>
              <div><EditableField value={data.shipToAddress} onChange={(v) => set("shipToAddress", v)} /></div>
              <div><EditableField value={data.shipToCity} onChange={(v) => set("shipToCity", v)} /></div>
              <div>State Name- <EditableField value={data.shipToState} onChange={(v) => set("shipToState", v)} /> &nbsp; Code: <EditableField value={data.shipToStateCode} onChange={(v) => set("shipToStateCode", v)} /></div>
              <div style={S.bold}>GSTIN/UIN: <EditableField value={data.shipToGSTIN} onChange={(v) => set("shipToGSTIN", v)} /></div>
            </td>
            <td style={S.td}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Bill of Lading/LR-RR No.</td>
                  <td style={S.tdNB}><EditableField value={data.lrRrNo} onChange={(v) => set("lrRrNo", v)} /></td>
                  <td style={S.tdNB} colSpan={2}><b>Motor Vehicle No.</b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}></td><td style={S.tdNB}></td>
                  <td style={S.tdNB} colSpan={2}><b><EditableField value={data.motorVehicleNo} onChange={(v) => set("motorVehicleNo", v)} /></b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Terms of Delivery</td>
                  <td style={S.tdNB} colSpan={3}><EditableField value={data.termsOfDelivery} onChange={(v) => set("termsOfDelivery", v)} /></td>
                </tr>
              </tbody></table>
            </td>
          </tr>
        </tbody></table>

        {/* Items Table */}
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Sl No.</th>
              <th style={S.th}>Description of Goods</th>
              <th style={S.th}>HSN/SAC</th>
              <th style={S.th}>GST Rate</th>
              <th style={S.th}>Quantity</th>
              <th style={S.th}>Rate</th>
              <th style={S.th}>Per</th>
              <th style={S.th}>Amount</th>
              <th style={{ ...S.th, background: "#fff", border: "none", width: "30px" }}></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ ...S.td, textAlign: "center" }}>{i + 1}</td>
                <td style={S.td}><b><EditableField value={item.description} onChange={(v) => setItem(i, "description", v)} /></b></td>
                <td style={{ ...S.td, textAlign: "center" }}><EditableField value={item.hsn} onChange={(v) => setItem(i, "hsn", v)} align="center" /></td>
                <td style={{ ...S.td, textAlign: "center" }}><EditableField value={String(item.gstRate)} onChange={(v) => setItem(i, "gstRate", parseFloat(v) || 0)} align="center" />%</td>
                <td style={{ ...S.td, textAlign: "center" }}>
                  <EditableField value={String(item.quantity)} onChange={(v) => setItem(i, "quantity", parseFloat(v) || 0)} align="center" />
                  {" "}<EditableField value={item.unit} onChange={(v) => setItem(i, "unit", v)} />
                </td>
                <td style={{ ...S.td, textAlign: "right" }}><EditableField value={String(item.rate)} onChange={(v) => setItem(i, "rate", parseFloat(v) || 0)} align="right" /></td>
                <td style={{ ...S.td, textAlign: "center" }}><EditableField value={item.per} onChange={(v) => setItem(i, "per", v)} align="center" /></td>
                <td style={{ ...S.td, textAlign: "right" }}>{parseFloat(item.amount).toFixed(2)}</td>
                <td style={{ border: "none", padding: "2px", verticalAlign: "middle" }}>
                  {data.items.length > 1 && <button style={S.delBtn} onClick={() => removeItem(i)}>✕</button>}
                </td>
              </tr>
            ))}
            {data.taxType === "CGST_SGST" ? (
              <>
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>CGST @ {gstRate / 2}%</td><td style={{ ...S.td, textAlign: "right" }}>{(totalTax / 2).toFixed(2)}</td><td style={{ border: "none" }}></td></tr>
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>SGST @ {gstRate / 2}%</td><td style={{ ...S.td, textAlign: "right" }}>{(totalTax / 2).toFixed(2)}</td><td style={{ border: "none" }}></td></tr>
              </>
            ) : (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>IGST @ {gstRate}%</td><td style={{ ...S.td, textAlign: "right" }}>{totalTax.toFixed(2)}</td><td style={{ border: "none" }}></td></tr>
            )}
            <tr>
              <td colSpan={4} style={{ ...S.td, textAlign: "right" }}><b>Total</b></td>
              <td style={{ ...S.td, textAlign: "center" }}><b>{totalQty.toFixed(3)} MT</b></td>
              <td style={S.td} colSpan={2}></td>
              <td style={{ ...S.td, textAlign: "right" }}><b>{grandTotal.toFixed(2)}</b></td>
              <td style={{ border: "none" }}></td>
            </tr>
          </tbody>
        </table>

        {/* Add Item */}
        <div style={{ padding: "4px 6px", borderBottom: "1px solid #000" }}>
          <button style={S.addBtn} onClick={addItem}>+ Add Item</button>
        </div>

        {/* Footer rows - declaration, PAN etc */}
        <table style={S.table}><tbody>
          <tr>
            <td style={S.td} colSpan={2}>
              Company's PAN: <EditableField value={data.companyPAN} onChange={(v) => set("companyPAN", v)} />
            </td>
            <td style={{ ...S.td, textAlign: "right" }}><b>{data.sellerName}</b></td>
          </tr>
          <tr>
            <td style={S.td} colSpan={2}>
              <div style={S.bold}>Declaration</div>
              <EditableField value={data.declaration} onChange={(v) => set("declaration", v)} multiline style={{ ...S.small, width: "100%" }} />
            </td>
            <td style={{ ...S.td, textAlign: "right" }}>
              <br /><br />Proprietor<br />Authorised Signatory
            </td>
          </tr>
        </tbody></table>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "6px", borderTop: "1px solid #000" }}>
          <EditableField value={data.jurisdiction} onChange={(v) => set("jurisdiction", v)} align="center" />
          <br /><span style={S.small}>This is a Computer Generated Invoice</span>
        </div>
      </div>
    </div>
  );
}
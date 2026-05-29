import React, { useState } from "react";
import axios from "axios";

function numberToWords(num) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (!num || isNaN(num)) return "";
  num = Math.round(num * 100) / 100;
  const [intPart, decPart] = num.toString().split(".");
  const toWords = (n) => {
    n = parseInt(n);
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + toWords(n % 100) : "");
    if (n < 100000) return toWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + toWords(n % 100000) : "");
    return toWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + toWords(n % 10000000) : "");
  };
  let result = toWords(parseInt(intPart)) + " Rupees";
  if (decPart && parseInt(decPart) > 0) result += " and " + toWords(parseInt(decPart)) + " Paise";
  return result + " Only";
}

export default function InvoicePreview({ data }) {
  const [downloading, setDownloading] = useState(false);

  const totalTaxableValue = data.items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const totalQty = data.items.reduce((s, i) => s + parseFloat(i.quantity || 0), 0);
  const totalTax = data.items.reduce((s, i) => s + (parseFloat(i.amount || 0) * parseFloat(i.gstRate || 0)) / 100, 0);
  const grandTotal = totalTaxableValue + totalTax;
  const gstRate = data.items[0]?.gstRate || 18;

  const S = {
    page: { background: "#e8e8e8", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" },
    box: { maxWidth: "900px", margin: "0 auto", background: "white", border: "1px solid #000", fontSize: "11px" },
    title: { textAlign: "center", fontWeight: "bold", fontSize: "15px", padding: "6px", borderBottom: "1px solid #000" },
    table: { width: "100%", borderCollapse: "collapse" },
    td: { border: "1px solid #000", padding: "4px 6px", verticalAlign: "top" },
    tdNB: { padding: "3px 6px", verticalAlign: "top" },
    th: { border: "1px solid #000", padding: "4px 6px", background: "#f5f5f5", fontWeight: "bold", textAlign: "center" },
    bold: { fontWeight: "bold" },
    small: { fontSize: "10px" },
    dlBtn: {
      background: downloading ? "#aaa" : "#1a73e8", color: "white", border: "none",
      padding: "10px 24px", borderRadius: "6px", cursor: downloading ? "not-allowed" : "pointer",
      fontSize: "14px", fontWeight: "bold",
    },
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 10px; color: #000; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #000; padding: 3px 5px; vertical-align: top; }
          b { font-weight: bold; }
        </style>
      </head><body>${document.getElementById("preview-area").innerHTML}</body></html>`;

      const response = await axios.post(
        "http://localhost:5000/api/invoice/generate-pdf",
        { html },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${data.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("PDF failed. Make sure backend is running on port 5000.");
    }
    setDownloading(false);
  };

  return (
    <div style={S.page}>
      {/* Download button */}
      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "12px", textAlign: "right" }}>
        <button style={S.dlBtn} onClick={downloadPDF} disabled={downloading}>
          {downloading ? "⏳ Generating PDF..." : "⬇️ Download PDF"}
        </button>
      </div>

      {/* Clean Invoice - Read Only */}
      <div id="preview-area" style={S.box}>
        <div style={S.title}>Tax Invoice</div>

        <table style={S.table}><tbody>
          {/* Seller + Invoice Info */}
          <tr>
            <td style={{ ...S.td, width: "50%" }}>
              <div style={S.bold}>{data.sellerName}</div>
              <div>{data.sellerAddress}</div>
              <div>{data.sellerDistrict}</div>
              <div>State Name: {data.sellerState} &nbsp; Code: {data.sellerStateCode}</div>
              <div style={S.bold}>GSTIN/UIN: {data.sellerGSTIN}</div>
            </td>
            <td style={{ ...S.td, width: "50%" }}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Invoice No.</td><td style={S.tdNB}><b>{data.invoiceNo}</b></td>
                  <td style={S.tdNB}>Dated</td><td style={S.tdNB}><b>{data.invoiceDate}</b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Delivery Note</td><td style={S.tdNB}>{data.deliveryNote}</td>
                  <td style={S.tdNB}>Mode/Terms of Payment</td><td style={S.tdNB}>{data.modeOfPayment}</td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Supplier's Ref.</td><td style={S.tdNB}>{data.supplierRef}</td>
                  <td style={S.tdNB}>Other Reference(s)</td><td style={S.tdNB}>{data.otherRef}</td>
                </tr>
              </tbody></table>
            </td>
          </tr>

          {/* Bill To */}
          <tr>
            <td style={S.td}>
              <div style={S.bold}>Bill To:-</div>
              <div style={S.bold}>{data.buyerName}</div>
              <div>{data.buyerAddress}</div>
              <div>{data.buyerCity}</div>
              <div>State Name- {data.buyerState} &nbsp; Code: {data.buyerStateCode}</div>
              <div style={S.bold}>GSTIN/UIN: {data.buyerGSTIN}</div>
            </td>
            <td style={S.td}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Buyer's Order No.</td><td style={S.tdNB}>{data.buyerOrderNo}</td>
                  <td style={S.tdNB}>Dated</td><td style={S.tdNB}>{data.buyerOrderDate}</td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Despatch Document No.</td><td style={S.tdNB}>{data.despatchDocNo}</td>
                  <td style={S.tdNB}>Delivery Note Date</td><td style={S.tdNB}>{data.deliveryNoteDate}</td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Despatched through</td>
                  <td style={S.tdNB} colSpan={3}><b>{data.despatchThrough}</b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Destination</td>
                  <td style={S.tdNB} colSpan={3}>{data.destination}</td>
                </tr>
              </tbody></table>
            </td>
          </tr>

          {/* Ship To */}
          <tr>
            <td style={S.td}>
              <div style={S.bold}>Ship To:-</div>
              <div style={S.bold}>{data.shipToName}</div>
              <div>{data.shipToAddress}</div>
              <div>{data.shipToCity}</div>
              <div>State Name- {data.shipToState} &nbsp; Code: {data.shipToStateCode}</div>
              <div style={S.bold}>GSTIN/UIN: {data.shipToGSTIN}</div>
            </td>
            <td style={S.td}>
              <table style={{ ...S.table, border: "none" }}><tbody>
                <tr>
                  <td style={S.tdNB}>Bill of Lading/LR-RR No.</td>
                  <td style={S.tdNB}>{data.lrRrNo}</td>
                  <td style={S.tdNB} colSpan={2}><b>Motor Vehicle No.</b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}></td><td style={S.tdNB}></td>
                  <td style={S.tdNB} colSpan={2}><b>{data.motorVehicleNo}</b></td>
                </tr>
                <tr>
                  <td style={S.tdNB}>Terms of Delivery</td>
                  <td style={S.tdNB} colSpan={3}>{data.termsOfDelivery}</td>
                </tr>
              </tbody></table>
            </td>
          </tr>
        </tbody></table>

        {/* Items */}
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
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ ...S.td, textAlign: "center" }}>{i + 1}</td>
                <td style={S.td}><b>{item.description}</b></td>
                <td style={{ ...S.td, textAlign: "center" }}>{item.hsn}</td>
                <td style={{ ...S.td, textAlign: "center" }}>{item.gstRate}%</td>
                <td style={{ ...S.td, textAlign: "center" }}>{item.quantity} {item.unit}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{parseFloat(item.rate).toFixed(2)}</td>
                <td style={{ ...S.td, textAlign: "center" }}>{item.per}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            ))}
            {data.taxType === "CGST_SGST" ? (
              <>
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>CGST @ {gstRate / 2}%</td><td style={{ ...S.td, textAlign: "right" }}>{(totalTax / 2).toFixed(2)}</td></tr>
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>SGST @ {gstRate / 2}%</td><td style={{ ...S.td, textAlign: "right" }}>{(totalTax / 2).toFixed(2)}</td></tr>
              </>
            ) : (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: "right" }}>IGST @ {gstRate}%</td><td style={{ ...S.td, textAlign: "right" }}>{totalTax.toFixed(2)}</td></tr>
            )}
            <tr>
              <td colSpan={4} style={{ ...S.td, textAlign: "right" }}><b>Total</b></td>
              <td style={{ ...S.td, textAlign: "center" }}><b>{totalQty.toFixed(3)} MT</b></td>
              <td style={S.td} colSpan={2}></td>
              <td style={{ ...S.td, textAlign: "right" }}><b>{grandTotal.toFixed(2)}</b></td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <table style={S.table}><tbody>
          <tr>
            <td style={S.td}>Amount Chargeable (in words)<br /><b>{numberToWords(grandTotal)}</b></td>
            <td style={{ ...S.td, textAlign: "right", whiteSpace: "nowrap" }}>E. &amp; O.E</td>
          </tr>
        </tbody></table>

        {/* HSN Summary */}
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>HSN/SAC</th>
              <th style={S.th}>Taxable Value</th>
              {data.taxType === "CGST_SGST" ? (
                <><th style={S.th}>CGST Rate</th><th style={S.th}>CGST Amt</th><th style={S.th}>SGST Rate</th><th style={S.th}>SGST Amt</th></>
              ) : (
                <><th style={S.th}>IGST Rate</th><th style={S.th}>IGST Amt</th><th style={S.th}>-</th><th style={S.th}>-</th></>
              )}
              <th style={S.th}>Cess Rate</th><th style={S.th}>Cess Amt</th><th style={S.th}>Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => {
              const taxAmt = (parseFloat(item.amount) * parseFloat(item.gstRate)) / 100;
              return (
                <tr key={i}>
                  <td style={{ ...S.td, textAlign: "center" }}>{item.hsn}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{parseFloat(item.amount).toFixed(2)}</td>
                  <td style={{ ...S.td, textAlign: "center" }}>{item.gstRate}%</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{data.taxType === "CGST_SGST" ? (taxAmt / 2).toFixed(2) : taxAmt.toFixed(2)}</td>
                  {data.taxType === "CGST_SGST" ? (
                    <><td style={{ ...S.td, textAlign: "center" }}>{item.gstRate / 2}%</td><td style={{ ...S.td, textAlign: "right" }}>{(taxAmt / 2).toFixed(2)}</td></>
                  ) : (
                    <><td style={{ ...S.td, textAlign: "center" }}>0</td><td style={{ ...S.td, textAlign: "right" }}>0.00</td></>
                  )}
                  <td style={{ ...S.td, textAlign: "center" }}>0</td>
                  <td style={{ ...S.td, textAlign: "right" }}>0.00</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{taxAmt.toFixed(2)}</td>
                </tr>
              );
            })}
            <tr>
              <td style={S.td}><b>Total</b></td>
              <td style={{ ...S.td, textAlign: "right" }}><b>{totalTaxableValue.toFixed(2)}</b></td>
              <td style={S.td}></td>
              <td style={{ ...S.td, textAlign: "right" }}><b>{totalTax.toFixed(2)}</b></td>
              <td style={S.td}></td><td style={S.td}></td>
              <td style={{ ...S.td, textAlign: "center" }}>0</td>
              <td style={{ ...S.td, textAlign: "right" }}>0.00</td>
              <td style={{ ...S.td, textAlign: "right" }}><b>{totalTax.toFixed(2)}</b></td>
            </tr>
          </tbody>
        </table>

        {/* Tax in words + Declaration */}
        <table style={S.table}><tbody>
          <tr>
            <td style={S.td} colSpan={2}>Tax Amount (in words): <b>{numberToWords(totalTax)}</b></td>
          </tr>
          <tr>
            <td style={S.td}>Company's PAN: {data.companyPAN}</td>
            <td style={{ ...S.td, textAlign: "right" }}><b>{data.sellerName}</b></td>
          </tr>
          <tr>
            <td style={S.td}>
              <div style={S.bold}>Declaration</div>
              <div style={S.small}>{data.declaration}</div>
            </td>
            <td style={{ ...S.td, textAlign: "right" }}>
              <br /><br />Proprietor<br />Authorised Signatory
            </td>
          </tr>
        </tbody></table>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "6px", borderTop: "1px solid #000" }}>
          {data.jurisdiction}<br />
          <span style={S.small}>This is a Computer Generated Invoice</span>
        </div>
      </div>
    </div>
  );
}
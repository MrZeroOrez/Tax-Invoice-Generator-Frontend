import React, { useState } from "react";
import InvoiceEditor from "./components/InvoiceEditor";
import InvoicePreview from "./components/InvoicePreview";
import "./styles/invoice.css";

const defaultData = {
  sellerName: "BAJRANG ENTERPRISES",
  sellerAddress: "GOPALPUR HR/12 0 NARAYANPUR Kolkata",
  sellerDistrict: "DIST-North Twenty Four Parganas-700136",
  sellerState: "WEST BENGAL",
  sellerStateCode: "19",
  sellerGSTIN: "19ELOPD6671K1ZE",
  invoiceNo: "48",
  invoiceDate: "10-May-26",
  deliveryNote: "",
  modeOfPayment: "",
  supplierRef: "",
  otherRef: "",
  buyerName: "MAHESHWARI ENTERPRISES",
  buyerAddress: "C/O KAILASH BIHARI SHROFF SURSAND ROAD, WARD NO-37",
  buyerCity: "SITAMARHI, BIHAR-843302",
  buyerState: "BR",
  buyerStateCode: "10",
  buyerGSTIN: "10ACCFM8241P1Z3",
  buyerOrderNo: "",
  buyerOrderDate: "",
  despatchDocNo: "",
  deliveryNoteDate: "",
  despatchThrough: "ROAD",
  destination: "",
  shipToName: "MAHESHWARI ENTERPRISES",
  shipToAddress: "C/O KAILASH BIHARI SHROFF SURSAND ROAD, WARD NO-37",
  shipToCity: "SITAMARHI, BIHAR-843302",
  shipToState: "BR",
  shipToStateCode: "10",
  shipToGSTIN: "10ACCFM8241P1Z3",
  lrRrNo: "",
  motorVehicleNo: "BR30GB2326",
  termsOfDelivery: "",
  taxType: "IGST",
  companyPAN: "",
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  jurisdiction: "SUBJECT TO WEST BENGAL JURISDICTION",
  items: [
    {
      slNo: 1,
      description: "ROM COAL",
      hsn: "27011200",
      gstRate: 18,
      quantity: 36.39,
      unit: "MT",
      rate: 4000,
      per: "MTS",
      amount: 145560,
    },
  ],
};

export default function App() {
  const [invoiceData, setInvoiceData] = useState(defaultData);
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div>
      {/* Tab Bar */}
      <div className="tab-bar">
        <button
          className={activeTab === "edit" ? "tab active" : "tab"}
          onClick={() => setActiveTab("edit")}
        >
          ✏️ Edit Invoice
        </button>
        <button
          className={activeTab === "preview" ? "tab active" : "tab"}
          onClick={() => setActiveTab("preview")}
        >
          👁️ Preview & Download
        </button>
      </div>

      {/* Render both but hide one — preserves state perfectly */}
      <div style={{ display: activeTab === "edit" ? "block" : "none" }}>
        <InvoiceEditor data={invoiceData} setData={setInvoiceData} />
      </div>
      <div style={{ display: activeTab === "preview" ? "block" : "none" }}>
        <InvoicePreview data={invoiceData} />
      </div>
    </div>
  );
}
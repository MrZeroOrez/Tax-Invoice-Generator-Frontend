import React, { useState } from "react";
import InvoiceEditor from "./components/InvoiceEditor";
import InvoicePreview from "./components/InvoicePreview";
import "./styles/invoice.css";

const defaultData = {
  sellerName: "MAHESHWARI ENTERPRISES",
  sellerAddress: "C/O KAILASH BIHARI SHROFF SURSAND ROAD, WARD NO-37",
  sellerDistrict: "SITAMARHI, BIHAR-843302",
  sellerState: "BIHAR",
  sellerStateCode: "10",
  sellerGSTIN: "10ACCFM8241P1Z3",
  invoiceNo: "48",
  invoiceDate: "10-May-26",
  deliveryNote: "",
  modeOfPayment: "",
  supplierRef: "",
  otherRef: "",
  buyerName: "BAJRANG ENTERPRISES",
  buyerAddress: "GOPALPUR HR/12 0 NARAYANPUR Kolkata",
  buyerCity: "DIST-North Twenty Four Parganas-700136",
  buyerState: "WEST BENGAL",
  buyerStateCode: "19",
  buyerGSTIN: "19ELOPD6671K1ZE",
  buyerOrderNo: "",
  buyerOrderDate: "",
  despatchDocNo: "",
  deliveryNoteDate: "",
  despatchThrough: "ROAD",
  destination: "",
  shipToName: "BAJRANG ENTERPRISES",
  shipToAddress: "GOPALPUR HR/12 0 NARAYANPUR Kolkata",
  shipToCity: "DIST-North Twenty Four Parganas-700136",
  shipToState: "WEST BENGAL",
  shipToStateCode: "19",
  shipToGSTIN: "19ELOPD6671K1ZE",
  lrRrNo: "",
  motorVehicleNo: "BR30GB2326",
  termsOfDelivery: "",
  taxType: "IGST",
  companyPAN: "",
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  jurisdiction: "SUBJECT TO BIHAR JURISDICTION",
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

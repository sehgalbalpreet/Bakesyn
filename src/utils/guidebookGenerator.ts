/**
 * Kreative Chocolates Academy - Artisan Master Workbook & PDF Generator
 * Generates a self-contained, offline-ready professional HTML workbook.
 * Features:
 *  - Inline embedded Kreative Chocolates SVG logo
 *  - Comprehensive coverage of Cocoa Sourcing, Bean-to-Bar, Tempering Chemistry, Coated Panning, Troubleshooting, and Costing & Margins
 *  - Fully functional offline interactive calculators (Master Panning Scale + Dynamic Costing & Margin Sheet)
 *  - Highly optimized printable page layouts with A4 media query pagination
 */

export function downloadAcademicGuidebook(almondBatchKg: number, selectedColor: string, sugarPanningSubMode: string) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // PRE-COMPUTE RECIPE VALUES FOR STATIC / NO-JS RENDERING
  const X = almondBatchKg;
  const mode = sugarPanningSubMode;
  const coreG = Math.round(X * 1000);
  
  let preCoatGum = 0;
  let preCoatWater = 0;
  let sucrose = 0;
  let glucose = 0;
  let water = 0;
  let totalSyrup = 0;
  let opaqueSyrup = 0;
  let opaqueOpacifier = 0;
  let colorSyrup = 0;
  let colorDye = "0";
  let carnauba = "0";
  let detailsText = "";
  
  if (mode === "chocolate-coated") {
    preCoatGum = Math.round(X * 6);
    preCoatWater = Math.round(X * 9);
    sucrose = Math.round(X * 266);
    glucose = Math.round(X * 14);
    water = Math.round(X * 120);
    totalSyrup = sucrose + glucose + water;
    opaqueSyrup = Math.round(totalSyrup * 0.6);
    opaqueOpacifier = Math.round(opaqueSyrup * 0.015);
    colorSyrup = Math.round(totalSyrup * 0.4);
    colorDye = (X * 1.8).toFixed(1);
    carnauba = (X * 0.5).toFixed(2);
    detailsText = "Chocolate Coated Centers (70° Brix Syrup)";
  } else {
    preCoatGum = Math.round(X * 30);
    preCoatWater = Math.round(X * 60);
    sucrose = Math.round(X * 700);
    glucose = Math.round(X * 35);
    water = Math.round(X * 235);
    totalSyrup = sucrose + glucose + water;
    opaqueSyrup = Math.round(totalSyrup * 0.6);
    opaqueOpacifier = Math.round(opaqueSyrup * 0.010);
    colorSyrup = Math.round(totalSyrup * 0.4);
    colorDye = (X * 1.5).toFixed(1);
    carnauba = (X * 0.5).toFixed(2);
    detailsText = "Classic Jordan Almonds (75° Brix Syrup)";
  }

  const l1_min = Math.round(60 * (X / 10));
  const l1_max = Math.round(80 * (X / 10));
  const l2_min = Math.round(100 * (X / 10));
  const l2_max = Math.round(130 * (X / 10));
  const l3_min = Math.round(50 * (X / 10));
  const l3_max = Math.round(60 * (X / 10));

  // PRE-COMPUTE FINANCIAL VALUES FOR STATIC / NO-JS RENDERING (SPLIT COSHEETS)
  // 1. Bean-to-Bar Chocolate Pre-computations
  const b2b_beanCost = 550.00;
  const b2b_beanLoss = 0.22;
  const b2b_sugarCost = 60.00;
  const b2b_butterCost = 950.00;
  const b2b_nibPct = 0.60;
  const b2b_sugarPct = 0.30;
  const b2b_butterPct = 0.10;
  const b2b_barWeightG = 80;
  const b2b_packagingCost = 10.00;
  const b2b_laborCost = 250.00;
  const b2b_laborThroughput = 15;
  const b2b_targetMargin = 0.65;
  
  const b2b_adjustedBeanCost = b2b_beanCost / (1 - b2b_beanLoss);
  const b2b_chocolateMaterialCost = (b2b_nibPct * b2b_adjustedBeanCost) + (b2b_sugarPct * b2b_sugarCost) + (b2b_butterPct * b2b_butterCost);
  const b2b_directMaterialUnit = (b2b_chocolateMaterialCost * (b2b_barWeightG / 1000)) + b2b_packagingCost;
  const b2b_laborCostUnit = b2b_laborCost / b2b_laborThroughput;
  const b2b_unitCOGS = b2b_directMaterialUnit + b2b_laborCostUnit;
  const b2b_targetWholesale = b2b_unitCOGS / (1 - b2b_targetMargin);
  const b2b_targetRetailPrice = b2b_targetWholesale * 1.5;

  // 2. Confectionery Panning Pre-computations (aligned with new 2/5/10kg batch model)
  const pan_batchSize = 5;
  const pan_rawNutCost = 650.00;
  const pan_roastingCost = 50.00;
  const pan_miscCost = 200.00;
  const pan_electricityCost = 150.00;
  const pan_laborRate = 250.00;
  const pan_laborHours = 4.0;
  const pan_chocCost = Math.round(b2b_chocolateMaterialCost);
  const pan_nutRatio = 40.0;
  const pan_margin = 60.0;

  const pan_nutWeightNeeded = pan_batchSize * (pan_nutRatio / 100);
  const pan_rawNutWeightNeeded = pan_nutWeightNeeded / 0.9;
  const pan_rawNutCostForBatch = pan_rawNutWeightNeeded * pan_rawNutCost;
  const pan_roastingCostForBatch = pan_rawNutWeightNeeded * pan_roastingCost;
  const pan_totalNutCostForBatch = pan_rawNutCostForBatch + pan_roastingCostForBatch;
  const pan_effectiveRoastedNutCostPerKg = (pan_rawNutCost + pan_roastingCost) / 0.9;

  const pan_chocWeightNeeded = pan_batchSize * (1 - pan_nutRatio / 100);
  const pan_chocCostForBatch = pan_chocWeightNeeded * pan_chocCost;

  const pan_laborCostForBatch = pan_laborHours * pan_laborRate;
  const pan_totalProductionCost = pan_totalNutCostForBatch + pan_chocCostForBatch + pan_laborCostForBatch + pan_electricityCost + pan_miscCost;
  const pan_costPerKg = pan_totalProductionCost / pan_batchSize;

  const pan_sellingPricePerKg = pan_margin < 100 ? pan_costPerKg / (1 - pan_margin / 100) : pan_costPerKg;
  const pan_totalSellingPrice = pan_sellingPricePerKg * pan_batchSize;
  const pan_grossProfit = pan_totalSellingPrice - pan_totalProductionCost;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kreative Chocolates: Artisan Confectionery Master Workbook</title>
  
  <!-- Premium Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  
  <style>
    /* Premium Palette & Variables */
    :root {
      --primary: #1e0d00;
      --primary-light: #fcf8f5;
      --accent: #825023;
      --accent-light: #f7ede2;
      --dark: #120904;
      --gray-light: #fbfbf9;
      --gray-border: #e8e2da;
      --text: #2f2217;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-serif: 'Playfair Display', Georgia, serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      color: var(--text);
      line-height: 1.6;
      background-color: #fcfbf8;
      padding: 0;
    }

    /* Core Layout Wrapper */
    .container {
      max-width: 940px;
      margin: 40px auto;
      background: white;
      padding: 70px 90px;
      border-radius: 32px;
      box-shadow: 0 15px 50px rgba(30, 13, 0, 0.04);
      border: 1px solid var(--gray-border);
    }

    /* Top Action Bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--primary-light);
      border: 1px solid var(--gray-border);
      padding: 14px 24px;
      border-radius: 16px;
      margin-bottom: 40px;
    }

    .action-info {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--accent);
      font-weight: bold;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--accent);
    }

    .btn-secondary {
      background-color: white;
      color: var(--primary);
      border: 1px solid var(--gray-border);
    }

    .btn-secondary:hover {
      background-color: var(--primary-light);
    }

    /* Elegant Brand Cover Page */
    .cover {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--gray-border);
      margin-bottom: 40px;
    }

    .brand-logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .brand-title {
      font-family: var(--font-serif);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--primary);
      margin-top: 10px;
    }

    .brand-subtitle {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 24px;
    }

    .workbook-badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: white;
      background-color: var(--primary);
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 24px;
    }

    .cover-title {
      font-family: var(--font-serif);
      font-size: 38px;
      font-weight: 900;
      color: var(--primary);
      line-height: 1.2;
      margin-bottom: 12px;
    }

    .cover-desc {
      font-size: 14px;
      color: #615246;
      max-width: 600px;
      margin: 0 auto 36px auto;
      font-style: italic;
    }

    /* Active Run Calibration Card - REDESIGNED START SECTION */
    .active-run-card {
      background-color: var(--primary-light);
      border: 1px solid var(--gray-border);
      border-radius: 20px;
      padding: 24px 30px;
      margin: 40px auto 20px auto;
      max-width: 800px;
      text-align: left;
      box-shadow: 0 4px 15px rgba(30, 13, 0, 0.02);
      page-break-inside: avoid;
    }

    .active-run-card .card-badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 1.5px;
      background-color: var(--accent);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .active-run-card .run-title {
      font-family: var(--font-serif);
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
    }

    .active-run-card .run-subtitle {
      font-size: 13px;
      color: #615246;
      margin-bottom: 20px;
      line-height: 1.5;
      text-align: left;
    }

    .run-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 16px;
      border-top: 1px solid var(--gray-border);
      border-bottom: 1px solid var(--gray-border);
      padding: 18px 0;
      margin-bottom: 16px;
    }

    .run-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .run-label {
      font-family: var(--font-mono);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c7d71;
    }

    .run-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
    }

    .run-desc {
      font-size: 11px;
      color: #806e60;
      line-height: 1.4;
    }

    .run-footer {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 10px;
      color: #8c7d71;
    }

    /* Headings & Section Styling */
    h2 {
      font-family: var(--font-serif);
      font-size: 24px;
      color: var(--primary);
      margin-top: 48px;
      margin-bottom: 18px;
      border-bottom: 1px solid var(--primary);
      padding-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-family: var(--font-serif);
      font-size: 16px;
      color: var(--accent);
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
      font-style: italic;
    }

    p {
      margin-bottom: 16px;
      font-size: 14px;
      color: #3d3025;
      text-align: justify;
    }

    /* Beautiful Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
      page-break-inside: avoid;
    }

    th {
      background-color: var(--accent-light);
      color: var(--primary);
      font-weight: 700;
      padding: 10px 14px;
      text-align: left;
      border: 1px solid var(--gray-border);
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 10px 14px;
      border: 1px solid var(--gray-border);
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #faf9f6;
    }

    /* Lists */
    ul, ol {
      margin-bottom: 20px;
      padding-left: 24px;
      font-size: 14px;
      color: #3d3025;
    }

    li {
      margin-bottom: 8px;
    }

    /* Panning Flow Visual Grid */
    .panning-flow-grid {
      display: grid;
      grid-template-cols: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 24px 0;
      page-break-inside: avoid;
    }

    .flow-card {
      background-color: var(--gray-light);
      border: 1px solid var(--gray-border);
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      position: relative;
    }

    .flow-step {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 1px;
      background-color: var(--primary);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .flow-title {
      font-family: var(--font-serif);
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
    }

    .flow-desc {
      font-size: 12px;
      color: #615246;
      line-height: 1.4;
    }

    /* Highlights & Notes */
    .note-box {
      background-color: var(--primary-light);
      border-left: 4px solid var(--accent);
      padding: 16px 20px;
      border-radius: 4px 12px 12px 4px;
      margin: 24px 0;
      font-size: 13px;
      page-break-inside: avoid;
    }

    .note-title {
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1px;
      color: var(--accent);
      margin-bottom: 6px;
    }

    /* Interactive Calculators Block */
    .calc-section {
      background-color: var(--primary-light);
      border: 1px solid var(--gray-border);
      border-radius: 20px;
      padding: 24px;
      margin: 32px 0;
      page-break-inside: avoid;
    }

    .calc-title-header {
      font-family: var(--font-serif);
      font-size: 18px;
      color: var(--primary);
      font-weight: 800;
      margin-bottom: 6px;
    }

    .calc-badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      background-color: var(--accent);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .calc-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      font-family: var(--font-mono);
      text-transform: uppercase;
    }

    input, select {
      padding: 10px 14px;
      border: 1px solid var(--gray-border);
      background-color: white;
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-sans);
      color: var(--dark);
      outline: none;
    }

    input:focus, select:focus {
      border-color: var(--accent);
    }

    .calc-btn {
      width: 100%;
      background-color: var(--primary);
      color: white;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .calc-btn:hover {
      background-color: var(--accent);
    }

    .results-area {
      background-color: white;
      border: 1px solid var(--gray-border);
      border-radius: 10px;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dark);
    }

    /* Tab System Styling */
    .tab-header {
      display: flex;
      gap: 12px;
      border-bottom: 2px solid var(--gray-border);
      margin-bottom: 20px;
    }
    .tab-btn {
      background: none;
      border: none;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 8px 12px;
      cursor: pointer;
      color: #8c7d71;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: var(--primary);
      border-bottom: 2px solid var(--accent);
    }
    .tab-container {
      display: none;
    }
    .tab-container.active {
      display: block;
    }

    /* Utility Page Break */
    .page-break {
      page-break-before: always;
    }

    /* Print Overrides */
    @media print {
      body {
        background-color: white;
        color: black;
      }
      .container {
        max-width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        box-shadow: none;
      }
      .action-bar, .calc-section {
        display: none !important;
      }
      h2 {
        border-bottom: 2px solid black;
        margin-top: 40px;
      }
      @page {
        size: A4;
        margin: 15mm 20mm 15mm 20mm;
      }
    }

    /* Mobile Viewport Responsiveness */
    @media (max-width: 768px) {
      body {
        background-color: #fcfbf8;
      }
      .container {
        padding: 24px 16px;
        margin: 12px auto;
        border-radius: 20px;
        box-shadow: none;
        border: none;
      }
      .action-bar {
        flex-direction: column;
        gap: 14px;
        text-align: center;
        padding: 16px;
        border-radius: 12px;
      }
      .action-bar div {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 8px;
      }
      .btn {
        width: 100%;
        justify-content: center;
        padding: 12px;
      }
      .brand-title {
        font-size: 24px;
        letter-spacing: 0.1em;
      }
      .cover-title {
        font-size: 26px;
      }
      .active-run-card {
        padding: 16px;
        margin: 24px auto 16px auto;
        border-radius: 16px;
      }
      .run-grid {
        grid-template-cols: 1fr;
        gap: 12px;
        padding: 14px 0;
      }
      .calc-grid {
        grid-template-cols: 1fr;
        gap: 14px;
      }
      h2 {
        font-size: 20px;
        margin-top: 32px;
        padding-bottom: 6px;
      }
      p {
        text-align: left;
        font-size: 13.5px;
      }
      ul, ol {
        padding-left: 18px;
        font-size: 13.5px;
      }
      table {
        display: block;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        font-size: 12px;
      }
      th, td {
        padding: 8px 10px;
      }
      .results-area {
        overflow-x: auto;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 16px 12px;
        margin: 8px auto;
        border-radius: 12px;
      }
      .brand-title {
        font-size: 18px;
        letter-spacing: 0.05em;
      }
      .brand-subtitle {
        font-size: 9px;
        letter-spacing: 0.1em;
      }
      .workbook-badge {
        font-size: 8px;
        padding: 4px 12px;
        margin-bottom: 16px;
      }
      .cover-title {
        font-size: 20px;
      }
      .cover-desc {
        font-size: 12px;
        margin-bottom: 24px;
      }
      h2 {
        font-size: 18px;
        margin-top: 24px;
      }
      h3 {
        font-size: 14px;
      }
      p, ul, ol, li {
        font-size: 13px;
      }
      .active-run-card {
        padding: 12px 10px;
        border-radius: 12px;
      }
      .active-run-card .run-title {
        font-size: 15px;
      }
      .active-run-card .run-subtitle {
        font-size: 11px;
        margin-bottom: 12px;
      }
      .calc-section {
        padding: 16px 12px;
        border-radius: 12px;
        margin: 20px 0;
      }
      .calc-title-header {
        font-size: 15px;
      }
      .results-area {
        padding: 12px 8px;
        font-size: 11px;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- PDF / Print Header -->
    <div class="action-bar">
      <span class="action-info">🔒 Kreative Chocolates Interactive Study Materials</span>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" onclick="window.print()">
          🖨️ Save / Export as PDF
        </button>
        <button class="btn btn-secondary" onclick="window.close()">
          ❌ Close Workbook
        </button>
      </div>
    </div>

    <!-- COVER SECTION -->
    <div class="cover">
      <div class="brand-logo-container">
        <!-- Reusable high-fidelity SVG reproduction of Kreative Chocolates Crown Logo -->
        <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F5E3B5" />
              <stop offset="30%" stop-color="#D4AF37" />
              <stop offset="70%" stop-color="#AA7C11" />
              <stop offset="100%" stop-color="#F5E3B5" />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#8A5F06" />
              <stop offset="50%" stop-color="#D4AF37" />
              <stop offset="100%" stop-color="#FCD34D" />
            </linearGradient>
          </defs>

          <path
            d="M 50,140 L 40,110 Q 52,118 64,124 L 75,85 Q 88,105 88,120 L 100,60 Q 112,105 112,120 L 125,85 Q 138,118 148,124 L 160,110 L 150,140 Q 100,148 50,140 Z"
            fill="url(#goldMetallic)"
            stroke="url(#goldAccent)"
            stroke-width="1.5"
            stroke-linejoin="round"
          />

          <path
            d="M 50,140 Q 100,148 150,140 L 150,148 Q 100,156 50,148 Z"
            fill="url(#goldAccent)"
          />

          <circle cx="40" cy="105" r="4.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" stroke-width="1" />
          <circle cx="75" cy="80" r="5.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" stroke-width="1" />
          <circle cx="100" cy="54" r="7" fill="url(#goldMetallic)" stroke="url(#goldAccent)" stroke-width="1" />
          <circle cx="125" cy="80" r="5.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" stroke-width="1" />
          <circle cx="160" cy="105" r="4.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" stroke-width="1" />

          <circle cx="100" cy="144" r="2.5" fill="#FFFFFF" />
          <circle cx="80" cy="143" r="2" fill="#FFFFFF" />
          <circle cx="120" cy="143" r="2" fill="#FFFFFF" />
          <circle cx="62" cy="141.5" r="1.5" fill="#FFFFFF" />
          <circle cx="138" cy="141.5" r="1.5" fill="#FFFFFF" />

          <path
            d="M 30,162 Q 100,178 170,162 Q 100,172 30,162"
            fill="url(#goldMetallic)"
          />
        </svg>
      </div>
      <h2 class="brand-title" style="border:none; margin:0; padding:0;">Kreative Chocolates</h2>
      <p class="brand-subtitle">Artisan Chocolatier Academy</p>
      
      <span class="workbook-badge">Complete Curriculum Workbook</span>
      <h1 class="cover-title">Sourcing, Processing, Tempering, Confectionery Panning, and Costing Margins</h1>
      <p class="cover-desc">
        A technical syllabus and printable laboratory manual compiling cocoa botanical terroir science, thermodynamics of tempering, chemical physical dynamics of panning, and ingredient costing financial models.
      </p>
    </div>

    <!-- MODULE 1 -->
    <h2>1. Botanical Sourcing & Cocoa Origins</h2>
    <p>
      Cocoa beans are the seeds of the evergreen tree <em>Theobroma cacao</em>, native to the tropical rainforests of the Americas. The physical chemistry and flavor complexity of the final chocolate bar are driven by two main factors: <strong>genetics</strong> and <strong>terroir</strong>.
    </p>
    
    <h3>Cocoa Genetics</h3>
    <ul>
      <li>
        <strong>Criollo:</strong> The "King of Cocoa". Exceptionally rare, representing less than 2% of global production. Criollo pods yield pale ivory seeds with low concentrations of astringent tannins. Flavor notes are delicate, displaying bright red fruit, honey, and floral jasmine.
      </li>
      <li>
        <strong>Forastero:</strong> The backbone of bulk cocoa, representing over 80% of global supply. Extremely disease-resistant and high-yielding. Forastero seeds are deep purple, rich in tannins, and require robust fermentation. It delivers a punchy, classic, chocolatey base notes with woody, bitter, and acidic undertones.
      </li>
      <li>
        <strong>Trinitario:</strong> An elegant, natural hybrid of Criollo and Forastero created in Trinidad. Trinitario combines the robust strength of Forastero with the delicate fruit and spice aromatics of Criollo. Features medium acidity and notes of dried plum, tobacco, and black currant.
      </li>
      <li>
        <strong>Nacional:</strong> A highly prized heirloom variety native to Ecuador. Delivers a highly distinctive aroma known as "Arriba flavor", characterized by intense notes of orange blossom, earthy cedar, and warm black tea.
      </li>
    </ul>

    <h3>The Power of Terroir</h3>
    <table>
      <thead>
        <tr>
          <th>Origin Country</th>
          <th>Representative Region</th>
          <th>Soil & Climate Characteristics</th>
          <th>Signature Flavor Profile</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>India</strong></td>
          <td>Idukki Valley (Kerala) / Anamalai Hills (Tamil Nadu)</td>
          <td>Grown in high-altitude shade-canopies intercropped with coconut, nutmeg, and black pepper. Volcanic laterite, monsoon humidity.</td>
          <td>Warm baking spices (nutmeg, clove), sweet raisin, mild citrus acidity, and a creamy, buttery milk-chocolate finish.</td>
        </tr>
        <tr>
          <td><strong>Madagascar</strong></td>
          <td>Sambirano Valley</td>
          <td>Rich, tropical alluvial soil, heavy rainfalls.</td>
          <td>Bright, citrusy, raspberry and tart cherry acidity.</td>
        </tr>
        <tr>
          <td><strong>Ecuador</strong></td>
          <td>Esmeraldas / Guayas</td>
          <td>Volcanic, mineral-dense, foggy mountain air.</td>
          <td>Intense floral jasmine, cedarwood, and licorice notes.</td>
        </tr>
        <tr>
          <td><strong>Venezuela</strong></td>
          <td>Chuao Coastal Rainforest</td>
          <td>Salty sea breezes, high humidity, alluvial valleys.</td>
          <td>Earthy honey, dark caramel, roasted almonds, ultra-smooth snap.</td>
        </tr>
        <tr>
          <td><strong>Ghana</strong></td>
          <td>Ashanti Belt</td>
          <td>Clay loam, dry seasons, traditional low-intensity sun drying.</td>
          <td>Classic, deep, robust cocoa, rich fudge and leather tones.</td>
        </tr>
      </tbody>
    </table>

    <h3>Deep Dive: The Indian Cocoa Ecosystem</h3>
    <p>
      In recent years, India has emerged as a premier producer of high-quality, fine-flavor single-origin cocoa beans. Sourced mostly from the southern states of <strong>Kerala</strong>, <strong>Tamil Nadu</strong>, <strong>Karnataka</strong>, and <strong>Andhra Pradesh</strong>, Indian beans are celebrated for their highly distinct, warm, spicy aromatics.
    </p>
    
    <div class="note-box" style="margin-top: 15px; margin-bottom: 15px;">
      <div class="note-title">Indian Agricultural Microclimates</div>
      <p style="margin: 0; font-size: 13px; line-height: 1.6;">
        Unlike massive monoculture plantations in West Africa, Indian cocoa is almost exclusively cultivated as an <strong>intercrop</strong>. Sown beneath the canopy of towering coconut palms, areca nuts, nutmeg, banana trees, and rubber plants, the cocoa trees grow in organic, bio-diverse microclimates. This unique polyculture farming imbues the cocoa beans with notes of surrounding spices like cardamom, nutmeg, and black pepper.
      </p>
    </div>

    <p>
      <strong>Sourcing and Post-Harvest Craft:</strong> Sourcing high-quality cocoa in India requires meticulous attention to post-harvest fermentation. In regions like the Idukki Valley, wet beans are gathered from local farmers and fermented in traditional cedarwood or jackwood box-sweats for 5 to 6 days. The beans are systematically turned every 24 to 48 hours to ensure oxygenation and temperature control. 
    </p>
    <p>
      Following fermentation, the beans are sun-dried. Due to the torrential Indian monsoons, modern estates employ unique greenhouse sliding-roof solar drying beds. This allows beans to dry slowly and evenly over 7 to 10 days while being quickly protected from sudden rains. This rigorous drying stage keeps moisture levels strictly under 7%, preventing mold while curing and harmonizing volatile organic acids.
    </p>

    <div class="page-break"></div>

    <!-- MODULE 2 -->
    <h2>2. Professional Bean-to-Bar Mechanics</h2>
    <p>
      Transforming raw agricultural cocoa seeds into luxurious liquid chocolate requires an unbroken chain of thermal, kinetic, and chemical processes:
    </p>
    <ol>
      <li>
        <strong>Fermentation (Terroir Chemistry):</strong> Harvesting is followed immediately by sweating the beans under banana leaves or in cedar boxes for 5-7 days. Microorganisms convert sugars to lactic and acetic acids, raising the temperature to 50°C. This kills the cocoa seed germ and triggers enzyme reactions that form essential flavor precursors.
      </li>
      <li>
        <strong>Drying & Sorting:</strong> Beans are sun-dried on flat screens to drop moisture content from 60% down to under 7%. Manual sorting removes sticks, rocks, flat beans, and damaged shells.
      </li>
      <li>
        <strong>Roasting (Maillard Reactions):</strong> Crucial for developing chocolate aroma. Roasting takes place between 110°C and 135°C for 20-40 minutes. Low, slow roasts preserve volatile fruit acids (Madagascar), while high roasts emphasize deep caramel and roasted nuts.
      </li>
      <li>
        <strong>Cracking & Winnowing:</strong> Roasted beans are shattered in an impact cracker. The light, fibrous husks are drawn away by an upstream vacuum air separator, leaving behind clean, heavy cocoa nibs. <em>Target shell residue must be strictly under 0.5% to preserve mouthfeel.</em>
      </li>
      <li>
        <strong>Refining & Conching (Refining to &lt;20 Microns):</strong> Nibs are ground in stone-roller melangers. High pressure and shear stress refine particle sizes down to under 20 microns (below the detection threshold of the human tongue). Conching aerates the warm cocoa mass, releasing bitter volatile acids (acetic acid) and coating each sugar crystal with luxurious cocoa butter.
      </li>
      <li>
        <strong>Aging:</strong> Liquid chocolate is cast into blocks and aged for 2-4 weeks to allow the fat molecules to settle and the complex flavor esters to harmonize.
      </li>
    </ol>

    <div class="note-box">
      <div class="note-title">Loss & Shrinkage Principle</div>
      <p style="margin: 0;">
        <strong>Crucial Winnowing Yield Rule:</strong> The husk of a cocoa bean represents roughly 15% to 20% of its raw weight. During roasting and winnowing, this weight is entirely lost as waste. Therefore, to obtain 1.0 kg of clean cocoa nibs, you must purchase and roast approximately 1.25 kg of raw cocoa beans!
      </p>
    </div>

    <!-- INTERACTIVE MELANGER CALCULATOR ADDON -->
    <div class="calc-section">
      <div class="calc-title-header">2. Fine-Flavor Melanger Blend &amp; Batching Calculator</div>
      <span class="calc-badge">Stone-Roller Refining Model</span>
      <p style="font-size: 13px; color: #5c4e43; margin-bottom: 16px;">
        Calculate exact ingredient ratios, raw bean requirements, and batch ingredient costing. Set your formulation percentages and raw material price points.
      </p>
      
      <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 8px; font-family: var(--font-mono);">
        1. Formulation Parameters
      </div>
      <div class="calc-grid" style="margin-bottom: 16px;">
        <div class="form-group">
          <label for="melanger_batchSizeInput">Target Chocolate Batch (kg):</label>
          <input type="number" id="melanger_batchSizeInput" value="3.0" step="0.5" min="0.1">
        </div>
        <div class="form-group">
          <label for="melanger_targetCacaoInput">Target Cacao Solids %:</label>
          <input type="number" id="melanger_targetCacaoInput" value="70" min="30" max="100" step="1">
        </div>
        <div class="form-group">
          <label for="melanger_addedButterInput">Added Extra Cocoa Butter %:</label>
          <input type="number" id="melanger_addedButterInput" value="5" min="0" max="40" step="1">
        </div>
        <div class="form-group">
          <label for="melanger_milkPercentInput">Milk Solids % (0 for Dark):</label>
          <input type="number" id="melanger_milkPercentInput" value="0" min="0" max="40" step="1">
        </div>
        <div class="form-group">
          <label for="melanger_shellLossInput">Winnowing Shell Loss (%):</label>
          <input type="number" id="melanger_shellLossInput" value="22" min="10" max="40" step="1">
        </div>
      </div>

      <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 8px; font-family: var(--font-mono);">
        2. Raw Material Unit Prices (₹/kg)
      </div>
      <div class="calc-grid" style="margin-bottom: 20px;">
        <div class="form-group">
          <label for="melanger_nibsPriceInput">Raw Cocoa Beans (₹/kg):</label>
          <input type="number" id="melanger_nibsPriceInput" value="600" step="10">
        </div>
        <div class="form-group">
          <label for="melanger_butterPriceInput">Cocoa Butter (₹/kg):</label>
          <input type="number" id="melanger_butterPriceInput" value="950" step="10">
        </div>
        <div class="form-group">
          <label for="melanger_sugarPriceInput">Cane Sugar (₹/kg):</label>
          <input type="number" id="melanger_sugarPriceInput" value="60" step="5">
        </div>
        <div class="form-group">
          <label for="melanger_milkPriceInput">Milk Powder (₹/kg):</label>
          <input type="number" id="melanger_milkPriceInput" value="450" step="10">
        </div>
        <div class="form-group">
          <label for="melanger_lecithinPriceInput">Soy Lecithin (₹/kg):</label>
          <input type="number" id="melanger_lecithinPriceInput" value="400" step="10">
        </div>
        <div class="form-group">
          <label for="melanger_vanillaPriceInput">Vanilla Flavor (₹/kg):</label>
          <input type="number" id="melanger_vanillaPriceInput" value="12000" step="100">
        </div>
      </div>

      <button class="calc-btn" onclick="runMelangerCalculator()">Calculate Melanger Batch</button>
      
      <div class="results-area" id="melanger-output">
        <!-- Dynamically computed -->
      </div>
    </div>

    <!-- MODULE 3 -->
    <h2>3. Thermodynamic Tempering Chemistry</h2>
    <p>
      Chocolate fat (cocoa butter) is polymorphic, meaning it can solidify into six distinct crystalline forms, each with unique melting thresholds, snapping characteristics, and physical densities. The sole objective of tempering is to encourage the crystallization of <strong>Form V (Beta Prime)</strong>, while melting out unstable low-melt forms.
    </p>
    
    <table>
      <thead>
        <tr>
          <th>Crystal Form</th>
          <th>Melting Point</th>
          <th>Physical Snap & Appearance</th>
          <th>Stability Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Form I & II</td>
          <td>17°C – 21°C</td>
          <td>Soft, crumbly, instantly sticky on fingers.</td>
          <td>Extremely Unstable</td>
        </tr>
        <tr>
          <td>Form III & IV</td>
          <td>22°C – 27°C</td>
          <td>Medium soft, dull appearance, prone to instant bloom.</td>
          <td>Unstable</td>
        </tr>
        <tr>
          <td><strong>Form V (&beta;)</strong></td>
          <td><strong>32°C – 34°C</strong></td>
          <td><strong>Flawless glossy shine, sharp crisp snap, shrinks for release.</strong></td>
          <td><strong>Perfect Stable Standard</strong></td>
        </tr>
        <tr>
          <td>Form VI</td>
          <td>36°C</td>
          <td>Hard, waxy, dull. Formed only after long-term aging from Form V.</td>
          <td>Ultra-Stable / Dull</td>
        </tr>
      </tbody>
    </table>

    <h3>Tempering Temperature Curves</h3>
    <p>
      Crystallization is manipulated by navigating precise thermal phases. The table below represents standard target curves for chocolate types:
    </p>
    <ul>
      <li>
        <strong>Dark Chocolate Curve:</strong> Melt completely to <strong>46°C - 50°C</strong> to erase all existing crystal memory. Cool down to <strong>27°C - 28°C</strong> to nucleate both stable Form V and unstable Form IV seeds. Re-heat to <strong>31°C - 32°C</strong> to selectively melt away unstable crystals, leaving only the stable Form V network active.
      </li>
      <li>
        <strong>Milk Chocolate Curve:</strong> Melt to <strong>43°C - 45°C</strong>. Cool to <strong>26°C - 27°C</strong>. Re-warm to <strong>29°C - 30°C</strong>.
      </li>
      <li>
        <strong>White Chocolate Curve:</strong> Melt to <strong>40°C - 42°C</strong>. Cool to <strong>25°C - 26°C</strong>. Re-warm to <strong>28°C - 29°C</strong>.
      </li>
    </ul>

    <div class="page-break"></div>

    <!-- MODULE 4 -->
    <h2>4. Coated Nuts & Sugar Panning SOP</h2>
    <p>
      Confectionery panning is the art of coating centers (nuts, dried fruits, or biscuit spheres) inside a rotating copper or stainless steel drum. Below is the precise sequential process utilized in artisan production kitchens:
    </p>
    
    <!-- Panning Flow Visual Grid -->
    <div class="panning-flow-grid">
      <div class="flow-card">
        <div class="flow-step">Phase 1</div>
        <div class="flow-title">Pre-Coat &amp; Oil Barrier</div>
        <div class="flow-desc">Raw nuts release natural oils that dissolve cocoa butter and trigger fat bloom. We seal the centers by tumbling them with a warm, water-soluble Gum Arabic solution. Once dry, it forms an oil-tight barrier.</div>
      </div>
      <div class="flow-card">
        <div class="flow-step">Phase 2</div>
        <div class="flow-title">Grossing &amp; Engrossing</div>
        <div class="flow-desc">Builds up the outer shell through sequential ladle-charges of liquid sugar syrups (70° Brix for Chocolate Coated centers, or 75° Brix for Jordan Almonds). Blown dry air evaporates water, crystallizing sucrose layer-by-layer.</div>
      </div>
      <div class="flow-card">
        <div class="flow-step">Phase 3</div>
        <div class="flow-title">Coloring &amp; Burnishing</div>
        <div class="flow-desc">Natural pigments are diluted in low-viscosity 60° Brix syrup. With the blowing air turned off, the colored syrup tumbles to smooth out surface wrinkles and burnish the shell to a matte, porcelain-like satin finish.</div>
      </div>
      <div class="flow-card">
        <div class="flow-step">Phase 4</div>
        <div class="flow-title">Polishing &amp; Glazing</div>
        <div class="flow-desc">Dusts the dry centers with micronized Carnauba wax. Continuous tumbling at 24-28 RPM uses clean friction to align the wax plates, creating a stunning glass-like high-gloss reflection.</div>
      </div>
    </div>

    <!-- INTERACTIVE PANNING CALCULATOR -->
    <div class="calc-section">
      <div class="calc-title-header">1. Artisan Panning Scale Calculator</div>
      <span class="calc-badge">Works Fully Offline</span>
      <p style="font-size: 13px; color: #5c4e43; margin-bottom: 16px;">
        Adjust the Core Batch Weight below to automatically compute the required raw materials and ladle charges.
      </p>
      
      <div class="calc-grid">
        <div class="form-group">
          <label for="panningBatchInput">Core Nut Weight (kg):</label>
          <input type="number" id="panningBatchInput" value="${almondBatchKg}" step="0.5" min="0.1">
        </div>
        <div class="form-group">
          <label for="panningStyleSelect">Panning Style Model:</label>
          <select id="panningStyleSelect">
            <option value="chocolate-coated" ${sugarPanningSubMode === "chocolate-coated" ? "selected" : ""}>Chocolate Coated Base (70° Brix)</option>
            <option value="jordan" ${sugarPanningSubMode === "jordan" ? "selected" : ""}>Jordan Almond Style (75° Brix)</option>
          </select>
        </div>
      </div>
      <button class="calc-btn" onclick="runPanningCalculator()">Calculate Scale Recipe</button>
      
      <div class="results-area" id="panning-output">
        <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
          SCALED WORKBOOK RECIPE (${X.toFixed(1)} kg Center Core - <u>${detailsText}</u>)
        </div>
        <div style="line-height: 1.8; font-size: 13px;">
          <strong>• Core Roasted Centers:</strong> ${coreG.toLocaleString()} g<br>
          <strong>• Gum Arabic Pre-Coat:</strong> ${preCoatGum.toLocaleString()} g Gum Arabic + ${preCoatWater.toLocaleString()} g Hot Water<br>
          <strong>• Master Engrossing Syrup:</strong> ${sucrose.toLocaleString()} g Sucrose + <u>${glucose.toLocaleString()} g Glucose</u> + ${water.toLocaleString()} g Water (Total cooked syrup: <strong>${totalSyrup.toLocaleString()} g</strong>)<br>
          
          <div style="margin: 10px 0; padding: 10px; background-color: #fcfbf9; border-radius: 6px; border: 1px dashed var(--gray-border);">
            <strong>Portion Split Guide:</strong><br>
            - <strong>60% White Opaque Base:</strong> ${opaqueSyrup.toLocaleString()} g Syrup + ${opaqueOpacifier} g Opacifier<br>
            - <strong>40% Colored Styling Syrup:</strong> ${colorSyrup.toLocaleString()} g Syrup + ${colorDye} g Powder Color
          </div>

          <div style="margin: 10px 0; padding: 10px; background-color: var(--accent-light); border-radius: 6px; border: 1px solid var(--gray-border);">
            <strong>SOP Ladle Charge Guide:</strong><br>
            - <strong>Foundation Coats (1 to 3):</strong> ${l1_min}–${l1_max} g / coat<br>
            - <strong>Grossing/Building Coats (4 to 8):</strong> ${l2_min}–${l2_max} g / coat<br>
            - <strong>Smooth-out/Final Coats (9 to 10):</strong> ${l3_min}–${l3_max} g / coat
          </div>

          <strong>• Mirror Buffing:</strong> Dust ${carnauba} g Carnauba Wax under strict clean dry air friction.
        </div>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- MODULE 5 -->
    <h2>5. Troubleshooting Confectionery Defects</h2>
    <p>
      In a production kitchen, slight changes in ambient humidity or cooling speeds can ruin high-end batches. Refer to this checklist to diagnose and fix failures in real time:
    </p>
    
    <table>
      <thead>
        <tr>
          <th>Symptom</th>
          <th>Root Cause Chemistry</th>
          <th>Remediation Corrective Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Fat Bloom (Grey Streaks)</strong></td>
          <td>Unstable butter polymorphs crystallize on the surface due to room heating (&gt;24°C).</td>
          <td>Strip off bad chocolate, re-temper. Control drying air temperature strictly between 13°C and 15°C.</td>
        </tr>
        <tr>
          <td><strong>Sugar Bloom (Sandiness)</strong></td>
          <td>Water condenses on the cold centers, dissolving sugar crystals which re-crystallize roughly.</td>
          <td>Never put chocolate in a cold room without an airtight wrap. Hold room humidity under 45%.</td>
        </tr>
        <tr>
          <td><strong>Nuts Clumping / Doubling</strong></td>
          <td>Syrup charge added too quickly, or rotating RPM too slow to spread wet syrup.</td>
          <td>Slightly heat the pan to break clumps, adjust pan speed to 25 RPM, and reduce ladle dose.</td>
        </tr>
        <tr>
          <td><strong>Dull, Cloudy Gloss</strong></td>
          <td>Wax applied before the underlying sugar shell was fully dry or during high ambient humidity.</td>
          <td>Let batch dry for 12 hours. Blow cold dry air before polishing with wax. Keep room RH &lt;40%.</td>
        </tr>
        <tr>
          <td><strong>Cores Seeping Oil</strong></td>
          <td>Inadequate Pre-coat Gum Arabic thickness. Oils dissolve the chocolate shell.</td>
          <td>Discard batch. In future runs, apply at least 2 distinct coats of Gum Arabic solution.</td>
        </tr>
      </tbody>
    </table>

    <div class="page-break"></div>

    <!-- MODULE 6 -->
    <h2>6. Financial Costing, Yield, & Margin Worksheet</h2>
    <p>
      Producing premium chocolate is a complex chemical science, but running a chocolate business is an exact mathematical science. In professional production, profitability hinges on tracking costs across two distinct, isolated phases: <strong>Bean-to-Bar Chocolate manufacturing</strong> and <strong>Confectionery Panning</strong>. 
    </p>
    <p>
      Below, we outline the exact business structures, mathematical formulae, and process-yield metrics for both operations.
    </p>

    <h3>Mathematical Business Formulae</h3>
    <ul>
      <li>
        <strong>Winnowing Shrinkage Adjustment:</strong> The outer fibrous shell of cocoa beans represents 15–25% of their weight and is discarded as waste. To find the cost of clean, usable cocoa nibs:
        <code style="font-family: var(--font-mono); font-size: 13px; color: var(--accent); display: block; padding: 6px; background: #faf9f6; margin: 6px 0;">Adjusted Cocoa Nib Cost (₹/kg) = Raw Bean Purchase Price / (1 - Shell Loss %)</code>
      </li>
      <li>
        <strong>Cost of Goods Sold (COGS):</strong> The cumulative sum of all direct materials (adjusted ingredients + wrappers/jars) + direct labor allocated per unit.
      </li>
      <li>
        <strong>Wholesale &amp; Retail Margin Multipliers:</strong>
        <code style="font-family: var(--font-mono); font-size: 12px; color: var(--accent); display: block; padding: 6px; background: #faf9f6; margin: 6px 0;">Wholesale Selling Price = Unit COGS / (1 - Target Gross Margin %)<br>Recommended Retail Price (MSRP) = Wholesale Price * Markup Multiplier (e.g., 1.5x to 1.6x)</code>
      </li>
    </ul>

    <!-- COST SHEET 1: BEAN TO BAR -->
    <h3 style="margin-top: 30px; font-size: 18px; border-bottom: 2px dashed var(--gray-border); padding-bottom: 6px;">Costing Sheet 1: Professional Bean-to-Bar Chocolate Bar Costing</h3>
    <p>
      This calculator models the direct manufacturing cost of producing molded single-origin chocolate bars (e.g. standard 80g fine-flavor bars) starting from raw cocoa beans.
    </p>
    
    <div class="calc-section">
      <div class="calc-title-header">Bean-to-Bar Costing Simulator</div>
      <span class="calc-badge">Fine-Flavor Cocoa Formulation</span>
      <p style="font-size: 13px; color: #5c4e43; margin-bottom: 16px;">
        Perform raw bean-to-bar costing simulations. Input your bean cost, shell waste factors, recipe ratios, bar weight, and direct artisan wrapping labor.
      </p>
      
      <div class="calc-grid">
        <div class="form-group">
          <label for="b2b_beanCostInput">Raw Cocoa Beans (₹/kg):</label>
          <input type="number" id="b2b_beanCostInput" value="550.00" step="10">
        </div>
        <div class="form-group">
          <label for="b2b_beanLossInput">Roast &amp; Winnow Shell Loss (%):</label>
          <input type="number" id="b2b_beanLossInput" value="22" min="0" max="50">
        </div>
        <div class="form-group">
          <label for="b2b_sugarCostInput">Organic Sugar (₹/kg):</label>
          <input type="number" id="b2b_sugarCostInput" value="60.00" step="5">
        </div>
        <div class="form-group">
          <label for="b2b_butterCostInput">Deodorized Cocoa Butter (₹/kg):</label>
          <input type="number" id="b2b_butterCostInput" value="950.00" step="10">
        </div>
        <div class="form-group">
          <label for="b2b_lecithinCostInput">Lecithin (₹/kg):</label>
          <input type="number" id="b2b_lecithinCostInput" value="400.00" step="10">
        </div>
        <div class="form-group">
          <label for="b2b_vanillaCostInput">Flavor/Vanilla (₹/kg):</label>
          <input type="number" id="b2b_vanillaCostInput" value="12000.00" step="100">
        </div>
        <div class="form-group">
          <label for="b2b_nibPctInput">Dark Chocolate Nib % (e.g. 60):</label>
          <input type="number" id="b2b_nibPctInput" value="60" min="10" max="100">
        </div>
        <div class="form-group">
          <label for="b2b_sugarPctInput">Organic Sugar % (e.g. 30):</label>
          <input type="number" id="b2b_sugarPctInput" value="30" min="0" max="90">
        </div>
        <div class="form-group">
          <label for="b2b_butterPctInput">Extra Added Cocoa Butter % (e.g. 10):</label>
          <input type="number" id="b2b_butterPctInput" value="10" min="0" max="50">
        </div>
        <div class="form-group">
          <label for="b2b_barWeightInput">Finished Bar Mold Weight (grams):</label>
          <input type="number" id="b2b_barWeightInput" value="80" step="5">
        </div>
        <div class="form-group">
          <label for="b2b_packagingCostInput">Wrapper Foil &amp; Card Sleeves (₹/bar):</label>
          <input type="number" id="b2b_packagingCostInput" value="10.00" step="0.5">
        </div>
        <div class="form-group">
          <label for="b2b_laborCostInput">Artisan Chocolatier Salary (₹/hour):</label>
          <input type="number" id="b2b_laborCostInput" value="250.00" step="10">
        </div>
        <div class="form-group">
          <label for="b2b_laborThroughputInput">Tempering/Packing Speed (bars/hour):</label>
          <input type="number" id="b2b_laborThroughputInput" value="15" step="1">
        </div>
        <div class="form-group">
          <label for="b2b_marginInput">Target Gross Margin (%):</label>
          <input type="number" id="b2b_marginInput" value="65" min="10" max="95">
        </div>
      </div>
      
      <button class="calc-btn" onclick="runB2BCostCalculator()">Compute Chocolate Bar Cost Sheet</button>
      
      <div class="results-area" id="b2b-cost-output">
        <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
          DYNAMIC CHOCOLATE BAR COGS &amp; MARGIN ANALYSIS (Per ${b2b_barWeightG}g Bar)
        </div>
        <div style="line-height: 1.8; font-size: 13px;">
          <strong>• Shrinkage Adjusted Cocoa Nibs:</strong> ₹${b2b_beanCost.toFixed(2)}/kg raw &rarr; <span style="color: #b45309; font-weight: bold;">₹${b2b_adjustedBeanCost.toFixed(2)}/kg</span> (at ${(b2b_beanLoss*100).toFixed(0)}% winnow loss)<br>
          <strong>• Combined Bulk Chocolate Mass Cost:</strong> <span style="font-weight: bold; color: var(--primary);">₹${b2b_chocolateMaterialCost.toFixed(2)} / kg</span> (nib/sugar/butter blend)<br>
          
          <div style="margin-top: 10px; padding: 12px; background-color: #faf9f6; border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--accent); display: block; margin-bottom: 4px;">Unit Cost Structure (${b2b_barWeightG}g Molded Bar):</strong>
            - <strong>Direct Materials:</strong> ₹${(b2b_chocolateMaterialCost * (b2b_barWeightG/1000)).toFixed(2)} chocolate mass + ₹${b2b_packagingCost.toFixed(2)} premium wrappers = ₹${b2b_directMaterialUnit.toFixed(2)}<br>
            - <strong>Allocated Direct Labor:</strong> ₹${b2b_laborCostUnit.toFixed(2)} (at ₹${b2b_laborCost.toFixed(2)}/hour producing ${b2b_laborThroughput} bars/hour)<br>
            - <span style="font-weight: bold; color: var(--primary);">TOTAL UNIT CHOCOLATE COGS: ₹${b2b_unitCOGS.toFixed(2)}</span>
          </div>

          <div style="margin-top: 10px; padding: 12px; background-color: var(--accent-light); border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--primary); display: block; margin-bottom: 4px;">Target Wholesale &amp; Retail Pricing Structure:</strong>
            - <strong>Target Gross Margin:</strong> ${(b2b_targetMargin * 100).toFixed(0)}%<br>
            - <strong>Recommended Wholesale Selling Price:</strong> <span style="font-size: 14px; font-weight: bold; color: #1e293b;">₹${b2b_targetWholesale.toFixed(2)}</span><br>
            - <strong>Recommended Retail Shelf Price (MSRP, 1.5x markup):</strong> <span style="font-size: 16px; font-weight: bold; color: var(--accent);">₹${b2b_targetRetailPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- COST SHEET 2: PANNING -->
    <h3 style="margin-top: 40px; font-size: 18px; border-bottom: 2px dashed var(--gray-border); padding-bottom: 6px;">Costing Sheet 2: Gourmet Coated Nuts Panning Costing</h3>
    <p>
      This calculator models the direct manufacturing and shrinkage-adjusted costs of producing gourmet chocolate-coated panned nuts based on selected production batch sizes.
    </p>

    <div class="calc-section">
      <div class="calc-title-header">Gourmet Coated Nuts Panning Costing Simulator</div>
      <span class="calc-badge">Formulation, Shrinkage &amp; Sizing</span>
      <p style="font-size: 13px; color: #5c4e43; margin-bottom: 16px;">
        Specify batch size, roasting moisture loss (strict academic 10% shrinkage factor), direct labor hours, processing utilities, raw ingredients, and target margins.
      </p>
      
      <div class="calc-grid">
        <div class="form-group">
          <label for="pan_batchSizeInput">Target Batch Size (kg):</label>
          <input type="number" id="pan_batchSizeInput" value="5" min="0.1" max="1000" step="0.5" style="width: 100%; padding: 8px; border: 1px solid var(--gray-border); border-radius: 8px; font-size: 13px; background: white;">
        </div>
        <div class="form-group">
          <label for="pan_rawNutCostInput">Raw Nuts Purchase Cost (₹/kg):</label>
          <input type="number" id="pan_rawNutCostInput" value="${pan_rawNutCost.toFixed(2)}" step="10">
        </div>
        <div class="form-group">
          <label for="pan_roastingCostInput">Roasting Cost (₹/kg raw):</label>
          <input type="number" id="pan_roastingCostInput" value="${pan_roastingCost.toFixed(2)}" step="5">
        </div>
        <div class="form-group">
          <label for="pan_chocCostInput">Chocolate Coating Cost (₹/kg):</label>
          <input type="number" id="pan_chocCostInput" value="${pan_chocCost.toFixed(2)}" step="10">
        </div>
        <div class="form-group">
          <label for="pan_nutRatioInput">Nut Center Ratio (%):</label>
          <input type="number" id="pan_nutRatioInput" value="${pan_nutRatio.toFixed(0)}" min="10" max="90" step="5">
        </div>
        <div class="form-group">
          <label for="pan_laborRateInput">Labor Wage (₹/hour):</label>
          <input type="number" id="pan_laborRateInput" value="${pan_laborRate.toFixed(2)}" step="10">
        </div>
        <div class="form-group">
          <label for="pan_laborHoursInput">Labor Hours Needed:</label>
          <input type="number" id="pan_laborHoursInput" value="${pan_laborHours.toFixed(1)}" step="0.5">
        </div>
        <div class="form-group">
          <label for="pan_electricityCostInput">Electricity Cost (₹):</label>
          <input type="number" id="pan_electricityCostInput" value="${pan_electricityCost.toFixed(2)}" step="10">
        </div>
        <div class="form-group">
          <label for="pan_miscCostInput">Miscellaneous Cost (₹):</label>
          <input type="number" id="pan_miscCostInput" value="${pan_miscCost.toFixed(2)}" step="10">
        </div>
        <div class="form-group">
          <label for="pan_marginInput">Target Gross Margin (%):</label>
          <input type="number" id="pan_marginInput" value="${pan_margin.toFixed(0)}" min="5" max="95">
        </div>
      </div>
      
      <button class="calc-btn" onclick="runPanningCostCalculator()">Compute Panning Economics</button>
      
      <div class="results-area" id="pan-cost-output">
        <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
          DYNAMIC PANNING CONFECTION COGS &amp; MARGIN ANALYSIS (Batch: ${pan_batchSize} kg finished)
        </div>
        <div style="line-height: 1.8; font-size: 13px;">
          <strong>• Effective Roasted Nut Cost (Moisture Adjusted):</strong> ₹${pan_effectiveRoastedNutCostPerKg.toFixed(2)} / kg<br>
          <strong>• Roasted Nut Weight Needed:</strong> ${pan_nutWeightNeeded.toFixed(2)} kg (Requires ${pan_rawNutWeightNeeded.toFixed(2)} kg raw nuts)<br>
          <strong>• Chocolate Coating Weight Needed:</strong> ${pan_chocWeightNeeded.toFixed(2)} kg (Cost: ₹${pan_chocCostForBatch.toFixed(2)})<br>
          
          <div style="margin-top: 10px; padding: 12px; background-color: #faf9f6; border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--accent); display: block; margin-bottom: 4px;">Direct Batch Cost Structure:</strong>
            - <strong>Raw Nuts Cost:</strong> ₹${pan_rawNutCostForBatch.toFixed(2)} + <strong>Roasting Cost:</strong> ₹${pan_roastingCostForBatch.toFixed(2)} = ₹${pan_totalNutCostForBatch.toFixed(2)}<br>
            - <strong>Chocolate Coating Cost:</strong> ₹${pan_chocCostForBatch.toFixed(2)}<br>
            - <strong>Direct Labor Cost:</strong> ₹${pan_laborCostForBatch.toFixed(2)} (${pan_laborHours} hrs at ₹${pan_laborRate}/hr)<br>
            - <strong>Processing Utilities (Electricity + Misc):</strong> ₹${(pan_electricityCost + pan_miscCost).toFixed(2)}<br>
            - <span style="font-weight: bold; color: var(--primary);">TOTAL PRODUCTION COST (BATCH COGS): ₹${pan_totalProductionCost.toFixed(2)}</span> (Cost per kg: ₹${pan_costPerKg.toFixed(2)}/kg)
          </div>

          <div style="margin-top: 10px; padding: 12px; background-color: var(--accent-light); border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--primary); display: block; margin-bottom: 4px;">Target Wholesale &amp; Retail Pricing Structure:</strong>
            - <strong>Target Gross Margin:</strong> ${pan_margin.toFixed(0)}%<br>
            - <strong>Suggested Selling Price per kg:</strong> <span style="font-weight: bold;">₹${pan_sellingPricePerKg.toFixed(2)}/kg</span><br>
            - <strong>Total Selling Price (Batch Value):</strong> <span style="font-size: 14px; font-weight: bold; color: #1e293b;">₹${pan_totalSellingPrice.toFixed(2)}</span><br>
            - <strong>Estimated Batch Gross Profit:</strong> <span style="font-size: 16px; font-weight: bold; color: var(--accent);">₹${pan_grossProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- WORKBOOK SIGNATURE HEADER -->
    <div style="margin-top: 60px; border-top: 1px solid var(--gray-border); padding-top: 24px; text-align: center; font-size: 11px; color: #8c7d71; font-family: var(--font-mono);">
      <p style="margin: 0;">
        "Great confectionery is a blend of accurate physical chemistry, temperature thermodynamics, and robust profit margins."
      </p>
      <p style="margin-top: 4px; font-weight: bold; color: var(--primary);">
        — Kreative Chocolates Academy Curriculum Board
      </p>
    </div>

  </div>

  <!-- CALCULATION SCRIPTS -->
  <script>
    function switchPanningWorkbookTab(tabId) {
      const tabs = ['specs', 'recipe', 'sop'];
      tabs.forEach(t => {
        const container = document.getElementById('pan-tab-' + t);
        const button = document.getElementById('pan-btn-' + t);
        if (container) {
          if (t === tabId) {
            container.classList.add('active');
          } else {
            container.classList.remove('active');
          }
        }
        if (button) {
          if (t === tabId) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });
    }

    function switchMelangerWorkbookTab(tabId) {
      const tabs = ['qty', 'cost'];
      tabs.forEach(t => {
        const container = document.getElementById('mel-tab-' + t);
        const button = document.getElementById('mel-btn-' + t);
        if (container) {
          if (t === tabId) {
            container.classList.add('active');
          } else {
            container.classList.remove('active');
          }
        }
        if (button) {
          if (t === tabId) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });
    }

    function runPanningCalculator() {
      const batchInput = document.getElementById('panningBatchInput');
      const modeSelect = document.getElementById('panningStyleSelect');
      const resultsDiv = document.getElementById('panning-output');
      
      const X = parseFloat(batchInput.value);
      if (isNaN(X) || X <= 0) {
        resultsDiv.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error: Please specify a valid core batch weight.</div>';
        return;
      }
      
      const mode = modeSelect.value;
      const coreG = Math.round(X * 1000);
      
      let preCoatGum, preCoatWater, detailsText;
      let sucrose, glucose, water, totalSyrup;
      let opaqueSyrup, opaqueOpacifier;
      let colorSyrup, colorDye;
      let carnauba;
      
      if (mode === 'chocolate-coated') {
        preCoatGum = Math.round(X * 6);
        preCoatWater = Math.round(X * 9);
        sucrose = Math.round(X * 266);
        glucose = Math.round(X * 14);
        water = Math.round(X * 120);
        totalSyrup = sucrose + glucose + water;
        
        opaqueSyrup = Math.round(totalSyrup * 0.6);
        opaqueOpacifier = Math.round(opaqueSyrup * 0.015);
        
        colorSyrup = Math.round(totalSyrup * 0.4);
        colorDye = (X * 1.8).toFixed(1);
        carnauba = (X * 0.5).toFixed(2);
        
        detailsText = "Chocolate Coated Centers (70° Brix Syrup)";
      } else {
        preCoatGum = Math.round(X * 30);
        preCoatWater = Math.round(X * 60);
        sucrose = Math.round(X * 700);
        glucose = Math.round(X * 35);
        water = Math.round(X * 235);
        totalSyrup = sucrose + glucose + water;
        
        opaqueSyrup = Math.round(totalSyrup * 0.6);
        opaqueOpacifier = Math.round(opaqueSyrup * 0.010);
        
        colorSyrup = Math.round(totalSyrup * 0.4);
        colorDye = (X * 1.5).toFixed(1);
        carnauba = (X * 0.5).toFixed(2);
        
        detailsText = "Classic Jordan Almonds (75° Brix Syrup)";
      }

      // Dynamic Ladle scale
      const l1_min = Math.round(60 * (X / 10));
      const l1_max = Math.round(80 * (X / 10));
      const l2_min = Math.round(100 * (X / 10));
      const l2_max = Math.round(130 * (X / 10));
      const l3_min = Math.round(50 * (X / 10));
      const l3_max = Math.round(60 * (X / 10));

      resultsDiv.innerHTML = \`
        <div class="tab-header" style="margin-top: 10px;">
          <button class="tab-btn active" id="pan-btn-specs" onclick="switchPanningWorkbookTab('specs')">Batch Specs</button>
          <button class="tab-btn" id="pan-btn-recipe" onclick="switchPanningWorkbookTab('recipe')">Recipe Details</button>
          <button class="tab-btn" id="pan-btn-sop" onclick="switchPanningWorkbookTab('sop')">SOP Steps</button>
        </div>

        <div id="pan-tab-specs" class="tab-container active">
          <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
            SCALED WORKBOOK SPECS (\${X.toFixed(1)} kg Center Core - <u>\${detailsText}</u>)
          </div>
          <div style="line-height: 1.8; font-size: 13px;">
  <strong>• Core Roasted Centers:</strong> \${coreG.toLocaleString()} g<br>
  <strong>• Gum Arabic Pre-Coat:</strong> \${preCoatGum.toLocaleString()} g Gum Arabic + \${preCoatWater.toLocaleString()} g Hot Water<br>
  <strong>• Master Engrossing Syrup:</strong> \${sucrose.toLocaleString()} g Sucrose + <u>\${glucose.toLocaleString()} g Glucose</u> + \${water.toLocaleString()} g Water (Total cooked syrup: <strong>\${totalSyrup.toLocaleString()} g</strong>)<br>
  
  <div style="margin: 10px 0; padding: 10px; background-color: #fcfbf9; border-radius: 6px; border: 1px dashed var(--gray-border);">
    <strong>Portion Split Guide:</strong><br>
    - <strong>60% White Opaque Base:</strong> \${opaqueSyrup.toLocaleString()} g Syrup + \${opaqueOpacifier} g Opacifier<br>
    - <strong>40% Colored Styling Syrup:</strong> \${colorSyrup.toLocaleString()} g Syrup + \${colorDye} g Powder Color
  </div>

  <div style="margin: 10px 0; padding: 10px; background-color: var(--accent-light); border-radius: 6px; border: 1px solid var(--gray-border);">
    <strong>SOP Ladle Charge Guide:</strong><br>
    - <strong>Foundation Coats (1 to 3):</strong> \${l1_min}–\${l1_max} g / coat<br>
    - <strong>Grossing/Building Coats (4 to 8):</strong> \${l2_min}–\${l2_max} g / coat<br>
    - <strong>Smooth-out/Final Coats (9 to 10):</strong> \${l3_min}–\${l3_max} g / coat
  </div>

  <strong>• Mirror Buffing:</strong> Dust \${carnauba} g Carnauba Wax under strict clean dry air friction.
          </div>
        </div>

        <div id="pan-tab-recipe" class="tab-container">
          <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
            DETAILED PANNING RECIPE
          </div>
          <div style="line-height: 1.8; font-size: 13px;">
            <div style="margin-bottom: 12px; padding: 10px; background-color: #fbfbf9; border-radius: 6px; border: 1px solid var(--gray-border);">
              <strong style="color: var(--accent);">Part A: Nuclei Preparation</strong><br>
              Take <strong>\${coreG.toLocaleString()} g</strong> of raw centers (almonds/hazelnuts). Dry-roast in a single layer at 150°C for 20 minutes until golden. Cool completely to 22°C before panning.
            </div>
            <div style="margin-bottom: 12px; padding: 10px; background-color: #fbfbf9; border-radius: 6px; border: 1px solid var(--gray-border);">
              <strong style="color: var(--accent);">Part B: Gum Arabic Pre-Coat</strong><br>
              Dissolve <strong>\${preCoatGum.toLocaleString()} g</strong> of Gum Arabic powder in <strong>\${preCoatWater.toLocaleString()} g</strong> of warm distilled water (60°C). Stir until perfectly clear and uniform. Set aside for sealing.
            </div>
            <div style="margin-bottom: 12px; padding: 10px; background-color: #fbfbf9; border-radius: 6px; border: 1px solid var(--gray-border);">
              <strong style="color: var(--accent);">Part C: Master Engrossing Syrup</strong><br>
              Boil <strong>\${sucrose.toLocaleString()} g</strong> sugar, <strong>\${glucose.toLocaleString()} g</strong> glucose, and <strong>\${water.toLocaleString()} g</strong> water together. Heat to 105°C to dissolve all solids, yielding a stable 70°/75° Brix syrup.
            </div>
            <div style="margin-bottom: 12px; padding: 10px; background-color: #fbfbf9; border-radius: 6px; border: 1px solid var(--gray-border);">
              <strong style="color: var(--accent);">Part D: Mirror Buffing Curing</strong><br>
              Pre-measure exactly <strong>\${carnauba} g</strong> of micronized Carnauba Wax (or confectioner's glaze) for the final high-friction shine stage.
            </div>
          </div>
        </div>

        <div id="pan-tab-sop" class="tab-container">
          <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
            STANDARD OPERATING PROCEDURES (SOP)
          </div>
          <div style="line-height: 1.8; font-size: 13px;">
            <div style="margin-bottom: 10px; border-left: 3px solid var(--accent); padding-left: 10px;">
              <strong>Step 1: Core Sealing & Pre-Coating</strong><br>
              Charge roasted cooled centers into the pan at 24-28 RPM. Drizzle the warm Gum Arabic pre-coat syrup over the tumbling bed. Blow dry air (38°C) until a glass-like shell forms to seal the nut oils.
            </div>
            <div style="margin-bottom: 10px; border-left: 3px solid var(--accent); padding-left: 10px;">
              <strong>Step 2: Grossing (Syrup Application)</strong><br>
              Apply the master syrup in steady ladle charges according to the Ladle Charge Guide (Foundations, Grossing, and Smooth-out phases). Evaporate water using cool dry air (15°C) between each charge.
            </div>
            <div style="margin-bottom: 10px; border-left: 3px solid var(--accent); padding-left: 10px;">
              <strong>Step 3: Friction Self-Burnishing</strong><br>
              Once building coats are complete, turn off all air blowers. Allow the pieces to roll and rub against each other for 10-15 minutes. Self-friction polishes the sugar shells to a pristine matte finish.
            </div>
            <div style="margin-bottom: 10px; border-left: 3px solid var(--accent); padding-left: 10px;">
              <strong>Step 4: Mirror Gloss Glazing</strong><br>
              Apply the Carnauba wax dusting. Maintain continuous rotation at 24-28 RPM with dry room air (RH &lt; 40%) until a brilliant, scratch-resistant high-gloss shellac shine is established.
            </div>
          </div>
        </div>
      \`;
      
      // Update the cover badge as well
      const panningBadgeEl = document.getElementById('panning-batch-text');
      if (panningBadgeEl) {
        panningBadgeEl.innerText = X.toFixed(1) + " kg Core Base Weight";
      }
    }

    function runB2BCostCalculator() {
      const beanCost = parseFloat(document.getElementById('b2b_beanCostInput').value);
      const beanLoss = parseFloat(document.getElementById('b2b_beanLossInput').value) / 100;
      const sugarCost = parseFloat(document.getElementById('b2b_sugarCostInput').value);
      const butterCost = parseFloat(document.getElementById('b2b_butterCostInput').value);
      const lecithinPrice = parseFloat(document.getElementById('b2b_lecithinCostInput').value);
      const vanillaPrice = parseFloat(document.getElementById('b2b_vanillaCostInput').value);
      
      const nibPct = parseFloat(document.getElementById('b2b_nibPctInput').value) / 100;
      const sugarPct = parseFloat(document.getElementById('b2b_sugarPctInput').value) / 100;
      const butterPct = parseFloat(document.getElementById('b2b_butterPctInput').value) / 100;
      const barWeightG = parseFloat(document.getElementById('b2b_barWeightInput').value);
      const packagingCost = parseFloat(document.getElementById('b2b_packagingCostInput').value);
      const laborCost = parseFloat(document.getElementById('b2b_laborCostInput').value);
      const laborThroughput = parseFloat(document.getElementById('b2b_laborThroughputInput').value);
      const targetMargin = parseFloat(document.getElementById('b2b_marginInput').value) / 100;
      
      const resultsDiv = document.getElementById('b2b-cost-output');
      
      if (isNaN(beanCost) || isNaN(beanLoss) || isNaN(sugarCost) || isNaN(butterCost) || isNaN(lecithinPrice) || isNaN(vanillaPrice) || isNaN(nibPct) || isNaN(sugarPct) || isNaN(butterPct) || isNaN(barWeightG) || isNaN(packagingCost) || isNaN(laborCost) || isNaN(laborThroughput) || isNaN(targetMargin)) {
        resultsDiv.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error: Please fill in all Bean-to-Bar input variables correctly.</div>';
        return;
      }
      
      const adjustedBeanCost = beanCost / (1 - beanLoss);
      const totalPct = nibPct + sugarPct + butterPct;
      const normalizedNib = nibPct / totalPct;
      const normalizedSugar = sugarPct / totalPct;
      const normalizedButter = butterPct / totalPct;
      
      const lecithinCostPerKg = lecithinPrice * 0.003;
      const vanillaCostPerKg = vanillaPrice * 0.0005;
      const chocolateMaterialCost = (normalizedNib * adjustedBeanCost) + (normalizedSugar * sugarCost) + (normalizedButter * butterCost) + lecithinCostPerKg + vanillaCostPerKg;
      
      const barWeightKg = barWeightG / 1000;
      const directMaterialUnit = (chocolateMaterialCost * barWeightKg) + packagingCost;
      const laborCostUnit = laborCost / laborThroughput;
      const unitCOGS = directMaterialUnit + laborCostUnit;
      
      const targetWholesale = unitCOGS / (1 - targetMargin);
      const targetRetailPrice = targetWholesale * 1.5;
      
      resultsDiv.innerHTML = \`
        <div class="tab-header" style="margin-top: 10px;">
          <button class="tab-btn active" id="mel-btn-qty" onclick="switchMelangerWorkbookTab('qty')">Batch Ingredients (Qty)</button>
          <button class="tab-btn" id="mel-btn-cost" onclick="switchMelangerWorkbookTab('cost')">Ingredient Pricing (Cost)</button>
        </div>

        <div id="mel-tab-qty" class="tab-container active">
          <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
            REQUIRED INGREDIENTS PER BATCH
          </div>
          <div style="line-height: 1.8; font-size: 13px;">
            <strong style="color: var(--primary); display: block; margin-bottom: 6px;">For a 1 kg Batch of Chocolate Mass:</strong>
            - <strong>Raw Cocoa Beans (to roast):</strong> \${((normalizedNib * 1000) / (1 - beanLoss)).toFixed(1)} g (to yield \${(normalizedNib * 1000).toFixed(1)} g roasted nibs after \${(beanLoss*100).toFixed(0)}% winnow loss)<br>
            - <strong>Organic Sugar:</strong> \${(normalizedSugar * 1000).toFixed(1)} g<br>
            - <strong>Deodorized Cocoa Butter:</strong> \${(normalizedButter * 1000).toFixed(1)} g<br>
            - <strong>Lecithin (0.3%):</strong> 3.0 g<br>
            - <strong>Flavor/Vanilla (0.05%):</strong> 0.5 g<br>
            
            <strong style="color: var(--primary); display: block; margin-top: 12px; margin-bottom: 6px;">For a Single \${barWeightG}g Molded Bar:</strong>
            - <strong>Raw Cocoa Beans (to roast):</strong> \${((normalizedNib * barWeightG) / (1 - beanLoss)).toFixed(2)} g (to yield \${(normalizedNib * barWeightG).toFixed(2)} g roasted nibs)<br>
            - <strong>Organic Sugar:</strong> \${(normalizedSugar * barWeightG).toFixed(2)} g<br>
            - <strong>Deodorized Cocoa Butter:</strong> \${(normalizedButter * barWeightG).toFixed(2)} g<br>
            - <strong>Lecithin (0.3%):</strong> \${(0.003 * barWeightG).toFixed(2)} g<br>
            - <strong>Flavor/Vanilla (0.05%):</strong> \${(0.0005 * barWeightG).toFixed(3)} g
          </div>
        </div>

        <div id="mel-tab-cost" class="tab-container">
          <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
            DYNAMIC CHOCOLATE BAR COGS &amp; MARGIN ANALYSIS (Per \${barWeightG}g Bar)
          </div>
          <div style="line-height: 1.8; font-size: 13px;">
            <strong>• Shrinkage Adjusted Cocoa Nibs:</strong> ₹\${beanCost.toFixed(2)}/kg raw &rarr; <span style="color: #b45309; font-weight: bold;">₹\${adjustedBeanCost.toFixed(2)}/kg</span> (at \${(beanLoss*100).toFixed(0)}% winnow loss)<br>
            <strong>• Combined Bulk Chocolate Mass Cost:</strong> <span style="font-weight: bold; color: var(--primary);">₹\${chocolateMaterialCost.toFixed(2)} / kg</span> (nibs + sugar + butter + lecithin + flavor)<br>
            
            <div style="margin-top: 10px; padding: 12px; background-color: #faf9f6; border-radius: 8px; border: 1px solid var(--gray-border);">
              <strong style="text-transform: uppercase; font-size: 10px; color: var(--accent); display: block; margin-bottom: 4px;">Unit Cost Structure (\&nbsp;\${barWeightG}g Molded Bar):</strong>
              - <strong>Cocoa Nibs Cost:</strong> ₹\${((normalizedNib * adjustedBeanCost) * barWeightKg).toFixed(2)}<br>
              - <strong>Organic Sugar Cost:</strong> ₹\${((normalizedSugar * sugarCost) * barWeightKg).toFixed(2)}<br>
              - <strong>Cocoa Butter Cost:</strong> ₹\${((normalizedButter * butterCost) * barWeightKg).toFixed(2)}<br>
              - <strong>Lecithin Cost:</strong> ₹\${(lecithinCostPerKg * barWeightKg).toFixed(4)}<br>
              - <strong>Flavor/Vanilla Cost:</strong> ₹\${(vanillaCostPerKg * barWeightKg).toFixed(4)}<br>
              - <strong>Premium Wrapper / Sleeves:</strong> ₹\${packagingCost.toFixed(2)}<br>
              - <strong>Allocated Direct Labor:</strong> ₹\${laborCostUnit.toFixed(2)} (at ₹\${laborCost.toFixed(2)}/hour producing \${laborThroughput} bars/hour)<br>
              - <span style="font-weight: bold; color: var(--primary);">TOTAL UNIT CHOCOLATE COGS: ₹\${unitCOGS.toFixed(2)}</span>
            </div>

            <div style="margin-top: 10px; padding: 12px; background-color: var(--accent-light); border-radius: 8px; border: 1px solid var(--gray-border);">
              <strong style="text-transform: uppercase; font-size: 10px; color: var(--primary); display: block; margin-bottom: 4px;">Target Wholesale &amp; Retail Pricing Structure:</strong>
              - <strong>Target Gross Margin:</strong> \${(targetMargin * 100).toFixed(0)}%<br>
              - <strong>Recommended Wholesale Selling Price:</strong> <span style="font-size: 14px; font-weight: bold; color: #1e293b;">₹\${targetWholesale.toFixed(2)}</span><br>
              - <strong>Recommended Retail Shelf Price (MSRP, 1.5x markup):</strong> <span style="font-size: 16px; font-weight: bold; color: var(--accent);">₹\${targetRetailPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      \`;
      
      // Update the input of chocolate cost in Panning calculator if the element exists
      const panChocInput = document.getElementById('pan_chocCostInput');
      if (panChocInput) {
        panChocInput.value = chocolateMaterialCost.toFixed(2);
      }
    }

    function runPanningCostCalculator() {
      const batchSize = parseFloat(document.getElementById('pan_batchSizeInput').value);
      const rawNutCost = parseFloat(document.getElementById('pan_rawNutCostInput').value);
      const roastingCost = parseFloat(document.getElementById('pan_roastingCostInput').value);
      const chocolateCost = parseFloat(document.getElementById('pan_chocCostInput').value);
      const nutRatio = parseFloat(document.getElementById('pan_nutRatioInput').value);
      const laborRate = parseFloat(document.getElementById('pan_laborRateInput').value);
      const laborHours = parseFloat(document.getElementById('pan_laborHoursInput').value);
      const electricityCost = parseFloat(document.getElementById('pan_electricityCostInput').value);
      const miscCost = parseFloat(document.getElementById('pan_miscCostInput').value);
      const targetMargin = parseFloat(document.getElementById('pan_marginInput').value) / 100;
      
      const resultsDiv = document.getElementById('pan-cost-output');
      
      if (isNaN(batchSize) || isNaN(rawNutCost) || isNaN(roastingCost) || isNaN(chocolateCost) || isNaN(nutRatio) || isNaN(laborRate) || isNaN(laborHours) || isNaN(electricityCost) || isNaN(miscCost) || isNaN(targetMargin)) {
        resultsDiv.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error: Please fill in all Panning input variables correctly.</div>';
        return;
      }
      
      // Calculations
      const nutWeightNeeded = batchSize * (nutRatio / 100);
      const rawNutWeightNeeded = nutWeightNeeded / 0.9;
      const rawNutCostForBatch = rawNutWeightNeeded * rawNutCost;
      const roastingCostForBatch = rawNutWeightNeeded * roastingCost;
      const totalNutCostForBatch = rawNutCostForBatch + roastingCostForBatch;
      const effectiveRoastedNutCostPerKg = (rawNutCost + roastingCost) / 0.9;

      const chocWeightNeeded = batchSize * (1 - nutRatio / 100);
      const chocCostForBatch = chocWeightNeeded * chocolateCost;

      const laborCostForBatch = laborHours * laborRate;
      const totalProductionCost = totalNutCostForBatch + chocCostForBatch + laborCostForBatch + electricityCost + miscCost;
      const costPerKg = totalProductionCost / batchSize;

      const sellingPricePerKg = targetMargin < 1 ? costPerKg / (1 - targetMargin) : costPerKg;
      const totalSellingPrice = sellingPricePerKg * batchSize;
      const grossProfit = totalSellingPrice - totalProductionCost;
      
      resultsDiv.innerHTML = \`
        <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
          DYNAMIC PANNING CONFECTION COGS &amp; MARGIN ANALYSIS (Batch: \${batchSize} kg finished)
        </div>
        <div style="line-height: 1.8; font-size: 13px;">
          <strong>• Effective Roasted Nut Cost (Moisture Adjusted):</strong> ₹\${effectiveRoastedNutCostPerKg.toFixed(2)} / kg<br>
          <strong>• Roasted Nut Weight Needed:</strong> \${nutWeightNeeded.toFixed(2)} kg (Requires \${rawNutWeightNeeded.toFixed(2)} kg raw nuts)<br>
          <strong>• Chocolate Coating Weight Needed:</strong> \${chocWeightNeeded.toFixed(2)} kg (Cost: ₹\${chocCostForBatch.toFixed(2)})<br>
          
          <div style="margin-top: 10px; padding: 12px; background-color: #faf9f6; border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--accent); display: block; margin-bottom: 4px;">Direct Batch Cost Structure:</strong>
            - <strong>Raw Nuts Cost:</strong> ₹\${rawNutCostForBatch.toFixed(2)} + <strong>Roasting Cost:</strong> ₹\${roastingCostForBatch.toFixed(2)} = ₹\${totalNutCostForBatch.toFixed(2)}<br>
            - <strong>Chocolate Coating Cost:</strong> ₹\${chocCostForBatch.toFixed(2)}<br>
            - <strong>Direct Labor Cost:</strong> ₹\${laborCostForBatch.toFixed(2)} (\${laborHours} hrs at ₹\${laborRate}/hr)<br>
            - <strong>Processing Utilities (Electricity + Misc):</strong> ₹\${(electricityCost + miscCost).toFixed(2)}<br>
            - <span style="font-weight: bold; color: var(--primary);">TOTAL PRODUCTION COST (BATCH COGS): ₹\${totalProductionCost.toFixed(2)}</span> (Cost per kg: ₹\${costPerKg.toFixed(2)}/kg)
          </div>

          <div style="margin-top: 10px; padding: 12px; background-color: var(--accent-light); border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--primary); display: block; margin-bottom: 4px;">Target Wholesale &amp; Retail Pricing Structure:</strong>
            - <strong>Target Gross Margin:</strong> \${(targetMargin * 100).toFixed(0)}%<br>
            - <strong>Suggested Selling Price per kg:</strong> <span style="font-weight: bold;">₹\${sellingPricePerKg.toFixed(2)}/kg</span><br>
            - <strong>Total Selling Price (Batch Value):</strong> <span style="font-size: 14px; font-weight: bold; color: #1e293b;">₹\${totalSellingPrice.toFixed(2)}</span><br>
            - <strong>Estimated Batch Gross Profit:</strong> <span style="font-size: 16px; font-weight: bold; color: var(--accent);">₹\${grossProfit.toFixed(2)}</span>
          </div>
        </div>
      \`;
    }

    function runMelangerCalculator() {
      const batchSize = parseFloat(document.getElementById('melanger_batchSizeInput').value);
      const targetCacao = parseFloat(document.getElementById('melanger_targetCacaoInput').value);
      const addedButter = parseFloat(document.getElementById('melanger_addedButterInput').value);
      const shellLoss = parseFloat(document.getElementById('melanger_shellLossInput').value) / 100;

      const resultsDiv = document.getElementById('melanger-output');
      if (isNaN(batchSize) || isNaN(targetCacao) || isNaN(addedButter) || isNaN(shellLoss)) {
        resultsDiv.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error: Please fill in all Melanger input variables correctly.</div>';
        return;
      }

      if (addedButter >= targetCacao) {
        resultsDiv.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error: Added cocoa butter % cannot be greater than or equal to total target cacao %.</div>';
        return;
      }

      const nibsPct = targetCacao - addedButter;
      const sugarPct = 100 - targetCacao;

      const nibsWeight = batchSize * (nibsPct / 100);
      const butterWeight = batchSize * (addedButter / 100);
      const sugarWeight = batchSize * (sugarPct / 100);

      // Shrinkage adjustment for raw beans
      const rawBeansNeeded = nibsWeight / (1 - shellLoss);

      resultsDiv.innerHTML = \`
        <div style="font-weight: bold; border-bottom: 1px solid var(--gray-border); padding-bottom: 8px; margin-bottom: 10px; color: var(--primary);">
          DYNAMIC MELANGER INGREDIENT BATCH RECEIPT (\${batchSize.toFixed(2)} kg Finished Chocolate at \${targetCacao.toFixed(0)}% Dark Cacao)
        </div>
        <div style="line-height: 1.8; font-size: 13px;">
          <strong>• Cocoa Nibs Required (Dry Weight):</strong> \${(nibsWeight * 1000).toFixed(0)} g (\${nibsPct.toFixed(1)}% of batch)<br>
          <strong>• Deodorized Cocoa Butter Added:</strong> \${(butterWeight * 1000).toFixed(0)} g (\${addedButter.toFixed(1)}% of batch)<br>
          <strong>• Organic Fine Sugar Added:</strong> \${(sugarWeight * 1000).toFixed(0)} g (\${sugarPct.toFixed(1)}% of batch)<br>
          
          <div style="margin-top: 10px; padding: 12px; background-color: var(--primary-light); border-radius: 8px; border: 1px solid var(--gray-border);">
            <strong style="text-transform: uppercase; font-size: 10px; color: var(--accent); display: block; margin-bottom: 4px;">Laboratory Roasting Sourcing Guide:</strong>
            - Due to winnowing shell loss of <strong>\${(shellLoss * 100).toFixed(0)}%</strong>, you must roast approximately <span style="font-weight: bold; color: var(--primary);">\${(rawBeansNeeded * 1000).toFixed(0)} g of raw cocoa beans</span> to produce the required clean nibs.
          </div>
        </div>
      \`;
    }

    // Auto calculate on load
    window.onload = function() {
      runPanningCalculator();
      runMelangerCalculator();
      runB2BCostCalculator();
      runPanningCostCalculator();
    };
  </script>

  <!-- WORKBOOK SIGNATURE HEADER -->
  <div style="margin-top: 60px; border-top: 1px solid var(--gray-border); padding-top: 24px; text-align: center; font-size: 11px; color: #8c7d71; font-family: var(--font-mono);">
    <p style="margin: 0;">
      "Great confectionery is a blend of accurate physical chemistry, temperature thermodynamics, and robust profit margins."
    </p>
    <p style="margin-top: 4px; font-weight: bold; color: var(--primary);">
      — Kreative Chocolates Academy Curriculum Board
    </p>
  </div>

</div>

</body>
</html>`;

  // Create downloadable file blob
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  // Create anchor trigger
  const a = document.createElement("a");
  a.href = url;
  a.download = `Kreative_Chocolates_Master_Workbook_${almondBatchKg}kg.html`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

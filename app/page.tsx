// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// ============ TYPES ============
interface Quote {
  id: string;
  customerName: string;
  make: string;
  model: string;
  year: string;
  value: string;
  repairType: string;
  company: string;
  thirdPartyLiability: string;
  coverageOptions: string[];
  omanCover: string;
  windscreenExcess: string;
  excess: number;
  premium: number;
  vat: number;
  total: number;
  isBest: boolean;
  isRenewal: boolean;
}

interface SavedComparison {
  id: string;
  date: string;
  vehicle: string;
  quotes: Quote[];
  advisorComment?: string;
  referenceNumber: string;
  fileUrl?: string;
}

// ============ CONSTANTS ============
const VEHICLE_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick', 'Cadillac', 
  'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'Ferrari', 'Fiat', 
  'Ford', 'GAC', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hummer', 'Hyundai', 'Infiniti', 
  'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 
  'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 
  'Peugeot', 'Porsche', 'RAM', 'Renault', 'Rolls-Royce', 'Saab', 'Seat', 'Skoda', 'Smart', 
  'SsangYong', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
];

const YEARS = [
  '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', 
  '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', 
  '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', 
  '1996', '1995', '1994', '1993', '1992', '1991', '1990'
];

const INSURANCE_COMPANIES = [
  'ABU DHABI NATIONAL INSURANCE COMPANY',
  'ADAMJEE INSURANCE COMPANY LIMITED',
  'AL AIN AHLIA INSURANCE CO. (PSC)',
  'AL BUHAIRA NATIONAL INSURANCE CO.',
  'AL DHAFRA INSURANCE COMPANY PSC',
  'AL FUJAIRAH NATIONAL INSURANCE COMPANY (P.S.C.)',
  'AL KHAZNA INSURANCE COMPANY P.S.C',
  'AL MADALLAH INSURANCE CO. PSC',
  'AL SAGR NATIONAL INSURANCE COMPANY',
  'AL WATHBA NATIONAL INSURANCE COMPANY P.S.C.',
  'ALLIANCE INSURANCE PSC',
  'ARAB ORIENT INSURANCE CO.',
  'ARABIA INSURANCE COMPANY PSC',
  'ASCANA INSURANCE COMPANY LLC',
  'AXA INSURANCE (GULF) B.S.C.(C)',
  'BUPA INSURANCE',
  'DAR AL TAKAFUL PJSC',
  'DAMAN NATIONAL HEALTH INSURANCE CO. PSC',
  'DUBAI INSURANCE CO. PSC',
  'DUBAI NATIONAL INSURANCE & REINSURANCE P.S.C.',
  'EMIRATES INSURANCE CO. (PSC)',
  'FIDELITY UNITED INSURANCE CO. PSC',
  'GIG GULF (GULF INSURANCE GROUP)',
  'GREEN CRESCENT INSURANCE COMPANY LLC',
  'INSURANCE HOUSE PSC',
  'Liva Insurance',
  'METHAQ TAKAFUL INSURANCE CO. PSC',
  'NATIONAL GENERAL INSURANCE CO. (PSC)',
  'NATIONAL HEALTH INSURANCE COMPANY - DAMAN',
  'NEURON INSURANCE PSC',
  'NOOR TAKAFUL FAMILY',
  'ORIENT INSURANCE PJSC',
  'ORIENT UNB TAKAFUL P.J.S.C',
  'OMAN INSURANCE CO. P.S.C',
  'Qatar INSURANCE COMPANY',
  'RAK NATIONAL INSURANCE CO PSC',
  'SALAMA ISLAMIC ARAB INSURANCE CO. PSC',
  'SUKOON INSURANCE CO. PSC',
  'TAKAFUL EMARAT',
  'UNION INSURANCE COMPANY PSC',
  'UNITED FIDELITY INSURANCE COMPANY PSC',
  'WATANIA INTERNATIONAL INSURANCE CO. PSC',
  'YAS TAKAFUL',
  'ZURICH INTERNATIONAL LIFE LIMITED'
];

const THIRD_PARTY_LIABILITY_OPTIONS = [
  'upto 1 million',
  'upto 1.5 million',
  'upto 2 million',
  'upto 2.5 million',
  'upto 3 million',
  'upto 3.5 million',
  'upto 4 million',
  'upto 4.5 million',
  'upto 5 million'
];

const OMAN_COVER_OPTIONS = [
  'Yes',
  'Yes(Orange Card available on request)',
  'No'
];

const WINDSCREEN_EXCESS_OPTIONS = [
  'upto 1000',
  'upto 1500',
  'upto 2000',
  'upto 2500',
  'upto 3000',
  'upto 3500',
  'upto 4000',
  'upto 4500',
  'upto 5000'
];

const COVERAGE_OPTIONS = [
  { id: 'fireTheft', label: 'Fire and theft cover' },
  { id: 'naturalCalamities', label: 'Natural Calamities Riot and strike' },
  { id: 'emergencyMedical', label: 'Emergency medical expenses' },
  { id: 'personalBelongings', label: 'Personal belongings' },
  { id: 'offroadCover', label: 'Off-road cover (For 4x4 only)' },
  { id: 'accidentRecovery', label: '24 Hour Accident and Breakdown Recovery' },
  { id: 'ambulanceCover', label: 'Ambulance Cover' },
  { id: 'driverCover', label: 'Optional Covers Driver Cover' },
  { id: 'passengersCover', label: 'Passengers Cover' },
  { id: 'hirecarBenefit', label: 'Hire car Benefit' }
];

const getCoverageDefaults = (company: string): string[] => {
  const defaults: Record<string, string[]> = {
    'UNITED FIDELITY INSURANCE COMPANY PSC': ['Natural Calamities Riot and strike', 'Emergency medical expenses', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'EMIRATES INSURANCE CO. (PSC)': ['Passengers Cover', 'Optional Covers Driver Cover', 'Natural Calamities Riot and strike'],
    'Liva Insurance': ['Natural Calamities Riot and strike', '24 Hour Accident and Breakdown Recovery', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'AXA INSURANCE (GULF) B.S.C.(C)': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Emergency medical expenses', '24 Hour Accident and Breakdown Recovery'],
    'DUBAI INSURANCE CO. PSC': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'TAKAFUL EMARAT': ['Natural Calamities Riot and strike', 'Emergency medical expenses', '24 Hour Accident and Breakdown Recovery'],
  };
  return defaults[company] || [];
};

const calculateVAT = (premium: number): { vat: number; total: number } => {
  const vat = Math.round(premium * 0.05);
  return { vat, total: premium + vat };
};

const generateReferenceNumber = (): string => {
  const timestamp = Date.now();
  const last4 = timestamp.toString().slice(-4);
  const random2 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${last4}${random2}`;
};

// ============ HTML GENERATOR ============
function generateHTMLContentHelper(sortedQuotes: Quote[], allCoverageOptions: string[], referenceNumber: string, advisorComment: string): string {
  const hasComment = advisorComment && advisorComment.trim().length > 0;
  const rowCount = allCoverageOptions.length + 9; // base rows + coverage rows
  const needsThirdPage = hasComment && rowCount > 12; // If comment exists and table is large

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NSIB Insurance Comparison</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; font-size: 10px; }
        .page1 { width: 210mm; height: 297mm; page-break-after: always; }
        .page1 img { width: 100%; height: 100%; object-fit: contain; }
        .page2 { width: 210mm; min-height: 297mm; padding: 8mm 10mm ${needsThirdPage ? '10mm' : '35mm'} 10mm; page-break-after: ${needsThirdPage ? 'always' : 'auto'}; position: relative; }
        .page3 { width: 210mm; height: 297mm; padding: 8mm 10mm 35mm 10mm; position: relative; }
        .header-simple { text-align: center; margin-bottom: 5mm; position: relative; height: 12mm; }
        .header-logo { height: 12mm; }
        .header-corner { position: absolute; right: 0; top: 0; height: 15mm; }
        .reference-number { position: absolute; top: 2mm; left: 10mm; font-size: 7px; color: #666; }
        .section-title { font-size: 16px; font-weight: bold; text-align: center; margin: 3mm 0; }
        .vehicle-info { background: #f8f9fa; padding: 2mm; text-align: center; margin: 2mm 0; font-size: 10px; }
        .comparison-table { width: 100%; border-collapse: collapse; font-size: 10px; margin: 2mm 0; table-layout: fixed; }
        .comparison-table th, .comparison-table td { border: 1px solid #000; padding: 2.5mm 2mm; text-align: center; vertical-align: middle; word-wrap: break-word; }
        .comparison-table th { background: #1e40af; color: white; font-size: 11px; padding: 3mm 2mm; font-weight: bold; }
        .comparison-table th:first-child, .comparison-table td:first-child { text-align: left; width: 40mm; }
        .comparison-table td:first-child { font-weight: bold; background: #f8f9fa; }
        .included { color: #28a745; font-weight: bold; }
        .not-included { color: #dc3545; font-weight: bold; }
        .total-row { background: #e3f2fd !important; font-weight: bold; }
        .renewal-badge { background: #ffc107; color: #000; padding: 1mm 2mm; border-radius: 2mm; font-size: 8px; font-weight: bold; display: inline-block; margin-top: 1mm; }
        .advisor-comment { background: #fff3cd; padding: 3mm; margin: 3mm 0; font-size: 9px; line-height: 1.4; border-left: 2mm solid #ffc107; }
        .advisor-comment h4 { font-size: 11px; margin-bottom: 2mm; color: #856404; }
        .disclaimer { background: #fff3cd; padding: 3mm; margin: 3mm 0; font-size: 8px; line-height: 1.4; border-left: 2mm solid #ffc107; }
        .disclaimer h4 { font-size: 10px; margin-bottom: 2mm; color: #856404; }
        .footer-contact { ${needsThirdPage ? '' : 'position: absolute; bottom: 0; left: 0; right: 0;'} width: 210mm; background: linear-gradient(135deg, rgba(255, 107, 107, 0.85) 0%, rgba(238, 90, 111, 0.85) 100%); padding: 4mm 10mm; display: flex; justify-content: space-between; color: white; font-size: 9px; line-height: 1.5; }
        .footer-left, .footer-right { flex: 1; }
        .footer-right { text-align: right; }
        .footer-contact strong { display: block; margin-bottom: 1mm; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="page1">
        <img src="https://i.imgur.com/qgsax5Y.png" alt="About">
    </div>
    <div class="${needsThirdPage ? 'page2' : 'page2'}">
        <div class="reference-number">Ref: ${referenceNumber}</div>
        <div class="header-simple">
            <img src="https://i.imgur.com/GCOPBN1.png" alt="Logo" class="header-logo">
            <img src="https://i.imgur.com/Wsv3Ah2.png" alt="Corner" class="header-corner">
        </div>
        <div class="section-title">MOTOR INSURANCE COMPARISON</div>
        <div class="vehicle-info">
            <strong>Customer: ${sortedQuotes[0].customerName} | Vehicle: ${sortedQuotes[0].make} ${sortedQuotes[0].model} (${sortedQuotes[0].year})</strong><br>
            Repair: ${sortedQuotes[0].repairType}
        </div>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>BENEFITS</th>
                    ${sortedQuotes.map((q) => `
                        <th>
                            <div style="font-size: 9px; margin-bottom: 1mm;">${q.company.length > 30 ? q.company.substring(0, 27) + '...' : q.company}</div>
                            ${q.isRenewal ? '<div class="renewal-badge">RENEWAL</div>' : ''}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Vehicle Value</td>
                    ${sortedQuotes.map(q => `<td>${q.value}</td>`).join('')}
                </tr>
                <tr>
                    <td>Third Party Liability</td>
                    ${sortedQuotes.map(q => `<td>${q.thirdPartyLiability}</td>`).join('')}
                </tr>
                <tr>
                    <td>Oman Cover</td>
                    ${sortedQuotes.map(q => `<td>${q.omanCover}</td>`).join('')}
                </tr>
                <tr>
                    <td>Windscreen Excess</td>
                    ${sortedQuotes.map(q => `<td>${q.windscreenExcess}</td>`).join('')}
                </tr>
                ${allCoverageOptions.map(option => `
                    <tr>
                        <td>${option}</td>
                        ${sortedQuotes.map(q => {
                            const inc = q.coverageOptions.includes(option);
                            return `<td class="${inc ? 'included' : 'not-included'}">${inc ? 'YES' : 'NO'}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
                <tr>
                    <td>Excess</td>
                    ${sortedQuotes.map(q => `<td>AED ${q.excess.toLocaleString()}</td>`).join('')}
                </tr>
                <tr>
                    <td>Premium</td>
                    ${sortedQuotes.map(q => `<td>AED ${q.premium.toLocaleString()}</td>`).join('')}
                </tr>
                <tr>
                    <td>VAT (5%)</td>
                    ${sortedQuotes.map(q => `<td>AED ${q.vat.toLocaleString()}</td>`).join('')}
                </tr>
                <tr class="total-row">
                    <td>Total</td>
                    ${sortedQuotes.map(q => `<td>AED ${q.total.toLocaleString()}</td>`).join('')}
                </tr>
                <tr>
                    <td>Best</td>
                    ${sortedQuotes.map(q => `<td class="${q.isBest ? 'included' : ''}">${q.isBest ? 'YES' : ''}</td>`).join('')}
                </tr>
            </tbody>
        </table>
        ${!needsThirdPage && hasComment ? `
        <div class="advisor-comment">
            <h4>Advisor Comment</h4>
            <p>${advisorComment}</p>
        </div>
        ` : ''}
        ${!needsThirdPage ? `
        <div class="disclaimer">
            <h4>Disclaimer</h4>
            <p>While we make every effort to ensure the accuracy and timeliness of the details provided in the comparison table, there may be instances where the actual coverage differs. In such cases, the terms outlined in the insurer&apos;s official policy wording and schedule will take precedence over the information provided by us.</p>
            <p style="margin-top: 2mm;">For the complete <strong>Material Information Declaration</strong> and <strong>Disclaimer</strong>, please refer to the quote.</p>
        </div>
        <div class="footer-contact">
            <div class="footer-left">
                <strong>Suite 2801, One by Omniyat</strong>
                Al Mustaqbal Street, Business Bay<br>
                Dubai, U.A.E<br>
                P O BOX 233640<br>
                <br>
                <strong>UAE Central Bank Registration Number : 200</strong>
            </div>
            <div class="footer-right">
                <strong>Call us on +971 47058000</strong>
                <br>
                Email us : enquiry@nsib.ae<br>
                <br>
                Visit our website: nsib.ae
            </div>
        </div>
        ` : ''}
    </div>
    ${needsThirdPage ? `
    <div class="page3">
        ${hasComment ? `
        <div class="advisor-comment">
            <h4>Advisor Comment</h4>
            <p>${advisorComment}</p>
        </div>
        ` : ''}
        <div class="disclaimer">
            <h4>Disclaimer</h4>
            <p>While we make every effort to ensure the accuracy and timeliness of the details provided in the comparison table, there may be instances where the actual coverage differs. In such cases, the terms outlined in the insurer&apos;s official policy wording and schedule will take precedence over the information provided by us.</p>
            <p style="margin-top: 2mm;">For the complete <strong>Material Information Declaration</strong> and <strong>Disclaimer</strong>, please refer to the quote.</p>
        </div>
        <div class="footer-contact">
            <div class="footer-left">
                <strong>Suite 2801, One by Omniyat</strong>
                Al Mustaqbal Street, Business Bay<br>
                Dubai, U.A.E<br>
                P O BOX 233640<br>
                <br>
                <strong>UAE Central Bank Registration Number : 200</strong>
            </div>
            <div class="footer-right">
                <strong>Call us on +971 47058000</strong>
                <br>
                Email us : enquiry@nsib.ae<br>
                <br>
                Visit our website: nsib.ae
            </div>
        </div>
    </div>
    ` : ''}
</body>
</html>`;
}

// ============ PDF GENERATOR ============
async function generatePDF(sortedQuotes: Quote[], allCoverageOptions: string[], referenceNumber: string, advisorComment: string): Promise<void> {
  const jsPDF = (await import('jspdf')).default;
  const html2canvas = (await import('html2canvas')).default;

  const htmlContent = generateHTMLContentHelper(sortedQuotes, allCoverageOptions, referenceNumber, advisorComment);
  
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm';
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = container.querySelectorAll('.page1, .page2, .page3');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }
    
    pdf.save(`NSIB_${sortedQuotes[0].customerName}_${sortedQuotes[0].make}_${sortedQuotes[0].model}_${referenceNumber}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// ============ MAIN COMPONENT ============
function QuoteGeneratorPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    vehicleMake: '',
    vehicleModel: '',
    yearModel: '',
    vehicleValue: '',
    repairType: '',
    insuranceCompany: '',
    thirdPartyLiability: 'upto 1 million',
    excess: 0,
    premium: 0,
    isBest: false,
    isRenewal: false,
  });
  const [selectedCoverage, setSelectedCoverage] = useState<string[]>([]);
  const [omanCover, setOmanCover] = useState('No');
  const [windscreenExcess, setWindscreenExcess] = useState('upto 1000');
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);
  const [advisorComment, setAdvisorComment] = useState('');

  const handlePremiumChange = (premium: number) => {
    const { vat: calculatedVat, total: calculatedTotal } = calculateVAT(premium);
    setVat(calculatedVat);
    setTotal(calculatedTotal);
    setFormData({ ...formData, premium });
  };

  const handleCompanyChange = (company: string) => {
    setFormData({ ...formData, insuranceCompany: company });
    const defaults = getCoverageDefaults(company);
    setSelectedCoverage(defaults);
  };

  const handleCoverageToggle = (label: string) => {
    setSelectedCoverage(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const addQuote = () => {
    if (!formData.customerName || !formData.vehicleMake || !formData.vehicleModel || !formData.insuranceCompany || !formData.premium) {
      alert('Please fill required fields: Name, Make, Model, Company, and Premium');
      return;
    }

    const existingIndex = quotes.findIndex(q => q.company === formData.insuranceCompany);
    if (existingIndex !== -1) {
      if (!confirm(`Quote for ${formData.insuranceCompany} already exists. Replace it?`)) return;
      const newQuotes = [...quotes];
      newQuotes.splice(existingIndex, 1);
      setQuotes(newQuotes);
    }

    const newQuote: Quote = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      make: formData.vehicleMake,
      model: formData.vehicleModel,
      year: formData.yearModel || 'Not specified',
      value: formData.vehicleValue || 'Not specified',
      repairType: formData.repairType || 'Not specified',
      company: formData.insuranceCompany,
      thirdPartyLiability: formData.thirdPartyLiability,
      coverageOptions: selectedCoverage,
      omanCover: omanCover,
      windscreenExcess: windscreenExcess,
      excess: formData.excess,
      premium: formData.premium,
      vat,
      total,
      isBest: formData.isBest,
      isRenewal: formData.isRenewal,
    };

    setQuotes([...quotes, newQuote]);
    clearForm();
    alert('Quote added to comparison!');
  };

  const clearForm = () => {
    setFormData({
      ...formData,
      insuranceCompany: '',
      thirdPartyLiability: 'upto 1 million',
      excess: 0,
      premium: 0,
      isBest: false,
      isRenewal: false,
    });
    setSelectedCoverage([]);
    setOmanCover('No');
    setWindscreenExcess('upto 1000');
    setVat(0);
    setTotal(0);
  };

  const removeQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const addDemoData = () => {
    const demoQuotes: Quote[] = [
      { company: 'AXA INSURANCE (GULF) B.S.C.(C)', premium: 2400, excess: 1000, isBest: true, isRenewal: false },
      { company: 'DUBAI INSURANCE CO. PSC', premium: 2200, excess: 800, isBest: false, isRenewal: true },
      { company: 'Liva Insurance', premium: 2600, excess: 1200, isBest: false, isRenewal: false }
    ].map((data, index) => {
      const { vat: demoVat, total: demoTotal } = calculateVAT(data.premium);
      return {
        id: (Date.now() + index).toString(),
        customerName: 'John Doe',
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        value: 'AED 85,000',
        repairType: 'Agency',
        company: data.company,
        thirdPartyLiability: 'upto 1 million',
        coverageOptions: getCoverageDefaults(data.company),
        omanCover: 'Yes',
        windscreenExcess: 'upto 1000',
        excess: data.excess,
        premium: data.premium,
        vat: demoVat,
        total: demoTotal,
        isBest: data.isBest,
        isRenewal: data.isRenewal,
      };
    });
    setQuotes(demoQuotes);
    alert('Demo data added!');
  };

  const saveToHistory = async () => {
    if (quotes.length === 0) {
      alert('No quotes to save. Add at least one quote first.');
      return;
    }

    try {
      const referenceNumber = generateReferenceNumber();
      const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
      const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];
      
      const htmlContent = generateHTMLContentHelper(sortedQuotes, allCoverageOptions, referenceNumber, advisorComment);
      const fileName = `NSIB_${quotes[0].customerName}_${quotes[0].make}_${quotes[0].model}_${referenceNumber}.html`;
      
      alert('Uploading document...');
      
      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, htmlContent }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
      
      const savedHistory = JSON.parse(localStorage.getItem('quotesHistory') || '[]');
      const newComparison: SavedComparison = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        vehicle: `${quotes[0].make} ${quotes[0].model}`,
        quotes: quotes,
        advisorComment: advisorComment,
        referenceNumber: referenceNumber,
        fileUrl: result.webViewLink,
      };
      savedHistory.unshift(newComparison);
      localStorage.setItem('quotesHistory', JSON.stringify(savedHistory));
      
      alert(`✅ Success!\n\n📄 File: ${fileName}\n🔗 URL: ${result.webViewLink}\n\nDocument saved and accessible online!`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('⚠️ Upload failed. Check browser console for details.');
    }
  };

  const generatePDFDocument = async () => {
    if (quotes.length === 0) return;

    const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
    const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];
    const referenceNumber = generateReferenceNumber();

    alert('Generating PDF... This may take a moment.');
    await generatePDF(sortedQuotes, allCoverageOptions, referenceNumber, advisorComment);
    alert('PDF downloaded successfully!');
  };

  const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
  const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Add Quote</h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Vehicle Information</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Customer Name *</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Make *</label>
              <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.vehicleMake} onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}>
                <option value="">Select Make</option>
                {VEHICLE_MAKES.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Model *</label>
              <input type="text" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="e.g., Camry" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-gray-800">Year Model</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.yearModel} onChange={(e) => setFormData({ ...formData, yearModel: e.target.value })}>
              <option value="">Select Year</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Quote Details</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Value</label>
            <input type="text" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="e.g., AED 85,000" value={formData.vehicleValue} onChange={(e) => setFormData({ ...formData, vehicleValue: e.target.value })} />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Repair Type</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.repairType} onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}>
              <option value="">Select Type</option>
              <option value="Agency">Agency</option>
              <option value="Non-Agency">Non-Agency</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Insurance Company *</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.insuranceCompany} onChange={(e) => handleCompanyChange(e.target.value)}>
              <option value="">Select Company</option>
              {INSURANCE_COMPANIES.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Third Party Property Liability</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.thirdPartyLiability} onChange={(e) => setFormData({ ...formData, thirdPartyLiability: e.target.value })}>
              {THIRD_PARTY_LIABILITY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Coverage Options</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {COVERAGE_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-2 p-2 bg-white rounded text-xs cursor-pointer hover:bg-gray-100 text-gray-800">
                  <input type="checkbox" checked={selectedCoverage.includes(option.label)} onChange={() => handleCoverageToggle(option.label)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Oman Cover (Own damage only)</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={omanCover} onChange={(e) => setOmanCover(e.target.value)}>
              {OMAN_COVER_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Excess for Windscreen Damage</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={windscreenExcess} onChange={(e) => setWindscreenExcess(e.target.value)}>
              {WINDSCREEN_EXCESS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Excess</label>
              <input type="number" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="1000" value={formData.excess || ''} onChange={(e) => setFormData({ ...formData, excess: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Premium *</label>
              <input type="number" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="2500" value={formData.premium || ''} onChange={(e) => handlePremiumChange(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">VAT (5%)</label>
              <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-900" value={vat} readOnly />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Total Amount</label>
              <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100 font-bold text-indigo-600" value={total} readOnly />
            </div>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={formData.isBest} onChange={(e) => setFormData({ ...formData, isBest: e.target.checked })} />
              Mark as Best
            </label>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={formData.isRenewal} onChange={(e) => setFormData({ ...formData, isRenewal: e.target.checked })} />
              Renewal
            </label>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Advisor Comment</label>
            <textarea
              className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
              placeholder="Enter advisor comments for this comparison..."
              rows={3}
              value={advisorComment}
              onChange={(e) => setAdvisorComment(e.target.value)}
            />
          </div>

          <button onClick={addQuote} className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-700 transition mb-2">
            Add Quote
          </button>
          
          <button onClick={addDemoData} className="w-full bg-yellow-500 text-gray-900 p-2 rounded-lg font-bold hover:bg-yellow-600 transition">
            Add Demo Data
          </button>
        </div>

        {quotes.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 mb-2">Current Comparison ({quotes.length})</h4>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {quotes.map(quote => (
                <div key={quote.id} className="bg-white p-2 rounded flex justify-between items-center border-l-4 border-indigo-600">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-indigo-600">{quote.company}</div>
                    <div className="text-xs text-gray-600">
                      AED {quote.total.toLocaleString()} 
                      {quote.isBest && ' ⭐'}
                      {quote.isRenewal && ' 🔄'}
                    </div>
                  </div>
                  <button onClick={() => removeQuote(quote.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button onClick={saveToHistory} className="w-full bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700 transition mb-2">
              💾 Save to History & Online Storage
            </button>
            <button onClick={generatePDFDocument} className="w-full bg-red-600 text-white p-2 rounded-lg font-bold hover:bg-red-700 transition">
              📄 Download as PDF
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-auto">
        <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Live Comparison</h2>
        
        {sortedQuotes.length === 0 ? (
          <div className="text-center text-gray-400 italic py-20">Add quotes to see comparison table</div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center border-l-4 border-indigo-600">
              <h3 className="font-bold text-base mb-1 text-gray-900">Customer: {sortedQuotes[0].customerName}</h3>
              <h3 className="font-bold text-base mb-1 text-gray-900">Vehicle: {sortedQuotes[0].make} {sortedQuotes[0].model} ({sortedQuotes[0].year})</h3>
              <p className="text-sm text-gray-600">Repair: {sortedQuotes[0].repairType}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="bg-indigo-600 text-white p-3 border text-left w-44">BENEFITS</th>
                    {sortedQuotes.map((q) => (
                      <th key={q.id} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 border text-center">
                        <div className="text-sm mb-1">{q.company.substring(0, 25)}</div>
                        {q.isRenewal && (
                          <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold inline-block mt-1">
                            RENEWAL
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Vehicle Value</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">{q.value}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Third Party Liability</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">{q.thirdPartyLiability}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Oman Cover</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">{q.omanCover}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Windscreen Excess</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">{q.windscreenExcess}</td>
                    ))}
                  </tr>
                  {allCoverageOptions.map(option => (
                    <tr key={option}>
                      <td className="p-2 border font-bold bg-gray-50 text-gray-900">{option}</td>
                      {sortedQuotes.map(q => {
                        const included = q.coverageOptions.includes(option);
                        return (
                          <td key={q.id} className={`p-2 border text-center font-bold ${included ? 'text-green-600' : 'text-red-600'}`}>
                            {included ? 'YES' : 'NO'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Excess</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">AED {q.excess.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Premium</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">AED {q.premium.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">VAT (5%)</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center text-gray-900">AED {q.vat.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="p-2 border font-bold text-gray-900">Total Premium</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className="p-2 border text-center font-bold text-gray-900">AED {q.total.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold bg-gray-50 text-gray-900">Best</td>
                    {sortedQuotes.map(q => (
                      <td key={q.id} className={`p-2 border text-center font-bold ${q.isBest ? 'text-green-600' : ''}`}>
                        {q.isBest ? 'YES' : ''}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SavedHistoryPage() {
  const [history, setHistory] = useState<SavedComparison[]>([]);
  const [editingComparison, setEditingComparison] = useState<SavedComparison | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = JSON.parse(localStorage.getItem('quotesHistory') || '[]');
    setHistory(saved);
  };

  const deleteComparison = (id: string) => {
    if (!confirm('Delete this comparison? This cannot be undone.')) return;
    
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('quotesHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  const startEdit = (comparison: SavedComparison) => {
    setEditingComparison({ ...comparison });
  };

  const cancelEdit = () => {
    setEditingComparison(null);
  };

  const saveEdit = () => {
    if (!editingComparison) return;

    const updated = history.map(h => 
      h.id === editingComparison.id ? editingComparison : h
    );
    localStorage.setItem('quotesHistory', JSON.stringify(updated));
    setHistory(updated);
    setEditingComparison(null);
    alert('Comparison updated successfully!');
  };

  const downloadPDF = async (comparison: SavedComparison) => {
    const sortedQuotes = [...comparison.quotes].sort((a, b) => a.total - b.total);
    const allCoverageOptions = [...new Set(comparison.quotes.flatMap(q => q.coverageOptions))];
    
    alert('Generating PDF... This may take a moment.');
    await generatePDF(sortedQuotes, allCoverageOptions, comparison.referenceNumber, comparison.advisorComment || '');
    alert('PDF downloaded successfully!');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Edit Modal
  if (editingComparison) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Comparison</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-gray-800">Advisor Comment</label>
            <textarea
              className="w-full p-3 border rounded text-sm text-gray-900 bg-white"
              rows={4}
              value={editingComparison.advisorComment || ''}
              onChange={(e) => setEditingComparison({ ...editingComparison, advisorComment: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Quotes ({editingComparison.quotes.length})</h3>
            <div className="space-y-4">
              {editingComparison.quotes.map((quote, idx) => (
                <div key={quote.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-800">Company</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded text-sm bg-gray-100"
                        value={quote.company}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-800">Premium</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                        value={quote.premium}
                        onChange={(e) => {
                          const newPremium = parseFloat(e.target.value) || 0;
                          const { vat, total } = calculateVAT(newPremium);
                          const newQuotes = [...editingComparison.quotes];
                          newQuotes[idx] = { ...quote, premium: newPremium, vat, total };
                          setEditingComparison({ ...editingComparison, quotes: newQuotes });
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-800">VAT (5%)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded text-sm bg-gray-100"
                        value={quote.vat}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-800">Total</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded text-sm bg-gray-100 font-bold text-indigo-600"
                        value={quote.total}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-800">Excess</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                        value={quote.excess}
                        onChange={(e) => {
                          const newQuotes = [...editingComparison.quotes];
                          newQuotes[idx] = { ...quote, excess: parseFloat(e.target.value) || 0 };
                          setEditingComparison({ ...editingComparison, quotes: newQuotes });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quote.isBest}
                        onChange={(e) => {
                          const newQuotes = [...editingComparison.quotes];
                          newQuotes[idx] = { ...quote, isBest: e.target.checked };
                          setEditingComparison({ ...editingComparison, quotes: newQuotes });
                        }}
                      />
                      Best
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quote.isRenewal}
                        onChange={(e) => {
                          const newQuotes = [...editingComparison.quotes];
                          newQuotes[idx] = { ...quote, isRenewal: e.target.checked };
                          setEditingComparison({ ...editingComparison, quotes: newQuotes });
                        }}
                      />
                      Renewal
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={saveEdit} className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
              ✓ Save Changes
            </button>
            <button onClick={cancelEdit} className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-bold hover:bg-gray-600 transition">
              ✗ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="bg-white rounded-xl p-5 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Saved History</h2>
        <p className="text-sm text-gray-600 mb-4">📁 All comparisons are saved online with public URLs</p>
        
        {history.length === 0 ? (
          <div className="text-center text-gray-400 italic py-20">
            No saved comparisons yet. Create a comparison and click &quot;Save to History&quot; to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(comparison => (
              <div key={comparison.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg text-gray-900">{comparison.vehicle}</div>
                    <div className="text-xs text-gray-500">{formatDate(comparison.date)}</div>
                    <div className="text-xs text-indigo-600 font-mono">Ref: {comparison.referenceNumber}</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-700 mb-2"><strong>Quotes:</strong> {comparison.quotes.length}</div>
                  <div className="text-xs text-gray-600">
                    {comparison.quotes.map(q => (
                      <div key={q.id} className="truncate">
                        • {q.company} - AED {q.total.toLocaleString()}
                        {q.isRenewal && ' 🔄'}
                        {q.isBest && ' ⭐'}
                      </div>
                    ))}
                  </div>
                </div>

                {comparison.advisorComment && (
                  <div className="mb-3 p-2 bg-yellow-50 rounded text-xs text-gray-700 border-l-2 border-yellow-400">
                    <strong>Comment:</strong> {comparison.advisorComment.substring(0, 100)}{comparison.advisorComment.length > 100 ? '...' : ''}
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {comparison.fileUrl && (
                    <a 
                      href={comparison.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700 transition text-center"
                    >
                      🔗 View
                    </a>
                  )}
                  <button onClick={() => downloadPDF(comparison)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-red-700 transition">
                    📄 PDF
                  </button>
                  <button onClick={() => startEdit(comparison)} className="bg-yellow-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-yellow-700 transition">
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteComparison(comparison.id)} className="bg-gray-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-700 transition">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'generator' | 'history'>('generator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-5">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">NSIB Insurance Quote System</h1>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setCurrentPage('generator')} 
              className={`px-8 py-3 rounded-lg font-bold transition ${currentPage === 'generator' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📝 Quote Generator
            </button>
            <button 
              onClick={() => setCurrentPage('history')} 
              className={`px-8 py-3 rounded-lg font-bold transition ${currentPage === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📁 Saved History
            </button>
          </div>
        </div>

        {currentPage === 'generator' ? <QuoteGeneratorPage /> : <SavedHistoryPage />}
      </div>
    </div>
  );
}
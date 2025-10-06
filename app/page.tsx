// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// ============ TYPES ============
interface Quote {
  id: string;
  make: string;
  model: string;
  year: string;
  value: string;
  repairType: string;
  company: string;
  lossOrDamage: number;
  coverageOptions: string[];
  excess: number;
  premium: number;
  vat: number;
  total: number;
}

interface SavedComparison {
  id: string;
  date: string;
  vehicle: string;
  quotes: Quote[];
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

const COVERAGE_OPTIONS = [
  { id: 'fireTheft', label: 'Fire and theft cover' },
  { id: 'naturalCalamities', label: 'Natural Calamities Riot and strike' },
  { id: 'emergencyMedical', label: 'Emergency medical expenses' },
  { id: 'personalBelongings', label: 'Personal belongings' },
  { id: 'omanCover', label: 'Oman Cover (Own damage only)' },
  { id: 'offroadCover', label: 'Off-road cover (For 4x4 only)' },
  { id: 'accidentRecovery', label: '24 Hour Accident and Breakdown Recovery' },
  { id: 'ambulanceCover', label: 'Ambulance Cover' },
  { id: 'windscreenDamage', label: 'Excess for windscreen damage' },
  { id: 'driverCover', label: 'Optional Covers Driver Cover' },
  { id: 'passengersCover', label: 'Passengers Cover' },
  { id: 'hirecarBenefit', label: 'Hire car Benefit' }
];

const getCoverageDefaults = (company: string): string[] => {
  const defaults: Record<string, string[]> = {
    'UNITED FIDELITY INSURANCE COMPANY PSC': ['Natural Calamities Riot and strike', 'Emergency medical expenses', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'EMIRATES INSURANCE CO. (PSC)': ['Passengers Cover', 'Optional Covers Driver Cover', 'Natural Calamities Riot and strike', 'Oman Cover (Own damage only)'],
    'Liva Insurance': ['Oman Cover (Own damage only)', 'Natural Calamities Riot and strike', 'Excess for windscreen damage', '24 Hour Accident and Breakdown Recovery', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'AXA INSURANCE (GULF) B.S.C.(C)': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Emergency medical expenses', '24 Hour Accident and Breakdown Recovery'],
    'DUBAI INSURANCE CO. PSC': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'TAKAFUL EMARAT': ['Natural Calamities Riot and strike', 'Emergency medical expenses', 'Oman Cover (Own damage only)', '24 Hour Accident and Breakdown Recovery'],
  };
  return defaults[company] || [];
};

const calculateVAT = (premium: number): { vat: number; total: number } => {
  const vat = Math.round(premium * 0.05);
  return { vat, total: premium + vat };
};

// ============ QUOTE GENERATOR PAGE ============
function QuoteGeneratorPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    yearModel: '',
    vehicleValue: '',
    repairType: '',
    insuranceCompany: '',
    lossOrDamage: 0,
    excess: 0,
    premium: 0,
  });
  const [selectedCoverage, setSelectedCoverage] = useState<string[]>([]);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

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
    if (!formData.vehicleMake || !formData.vehicleModel || !formData.insuranceCompany || !formData.premium) {
      alert('Please fill required fields: Make, Model, Company, and Premium');
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
      make: formData.vehicleMake,
      model: formData.vehicleModel,
      year: formData.yearModel || 'Not specified',
      value: formData.vehicleValue || 'Not specified',
      repairType: formData.repairType || 'Not specified',
      company: formData.insuranceCompany,
      lossOrDamage: formData.lossOrDamage,
      coverageOptions: selectedCoverage,
      excess: formData.excess,
      premium: formData.premium,
      vat,
      total,
    };

    setQuotes([...quotes, newQuote]);
    clearForm();
    alert('Quote added to comparison!');
  };

  const clearForm = () => {
    setFormData({
      ...formData,
      insuranceCompany: '',
      lossOrDamage: 0,
      excess: 0,
      premium: 0,
    });
    setSelectedCoverage([]);
    setVat(0);
    setTotal(0);
  };

  const removeQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const addDemoData = () => {
    const demoQuotes: Quote[] = [
      { company: 'AXA INSURANCE (GULF) B.S.C.(C)', premium: 2400, excess: 1000 },
      { company: 'DUBAI INSURANCE CO. PSC', premium: 2200, excess: 800 },
      { company: 'Liva Insurance', premium: 2600, excess: 1200 }
    ].map((data, index) => {
      const { vat: demoVat, total: demoTotal } = calculateVAT(data.premium);
      return {
        id: (Date.now() + index).toString(),
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        value: 'AED 85,000',
        repairType: 'Agency',
        company: data.company,
        lossOrDamage: 85000,
        coverageOptions: getCoverageDefaults(data.company),
        excess: data.excess,
        premium: data.premium,
        vat: demoVat,
        total: demoTotal,
      };
    });
    setQuotes(demoQuotes);
    alert('Demo data added!');
  };

  const saveToHistory = () => {
    if (quotes.length === 0) {
      alert('No quotes to save. Add at least one quote first.');
      return;
    }

    const savedHistory = JSON.parse(localStorage.getItem('quotesHistory') || '[]');
    
    const newComparison: SavedComparison = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      vehicle: `${quotes[0].make} ${quotes[0].model}`,
      quotes: quotes,
    };

    savedHistory.unshift(newComparison);
    localStorage.setItem('quotesHistory', JSON.stringify(savedHistory));
    
    alert(`Saved! ${quotes.length} quotes for ${newComparison.vehicle} saved to history. Go to "Saved History" tab to view.`);
  };

  const generateDocument = () => {
    if (quotes.length === 0) return;

    const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
    const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NSIB Insurance Comparison</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; font-size: 8px; }
        .page1 { width: 210mm; height: 297mm; page-break-after: always; }
        .page1 img { width: 100%; height: 100%; object-fit: contain; }
        .page2 { width: 210mm; height: 297mm; padding: 8mm 10mm 35mm 10mm; page-break-after: always; position: relative; }
        .header-simple { text-align: center; margin-bottom: 5mm; position: relative; height: 12mm; }
        .header-logo { height: 12mm; }
        .header-corner { position: absolute; right: 0; top: 0; height: 15mm; }
        .section-title { font-size: 14px; font-weight: bold; text-align: center; margin: 3mm 0; }
        .vehicle-info { background: #f8f9fa; padding: 2mm; text-align: center; margin: 2mm 0; font-size: 9px; }
        .comparison-table { width: 100%; border-collapse: collapse; font-size: 8.5px; margin: 2mm 0; table-layout: fixed; }
        .comparison-table th, .comparison-table td { border: 1px solid #000; padding: 2mm 1.5mm; text-align: center; vertical-align: middle; word-wrap: break-word; }
        .comparison-table th { background: #1e40af; color: white; font-size: 9.5px; padding: 2.5mm 1.5mm; }
        .comparison-table th:first-child, .comparison-table td:first-child { text-align: left; width: 35mm; }
        .comparison-table td:first-child { font-weight: bold; background: #f8f9fa; }
        .included { color: #28a745; font-weight: bold; }
        .not-included { color: #dc3545; font-weight: bold; }
        .total-row { background: #e3f2fd !important; font-weight: bold; }
        .summary-box { background: #d4edda; padding: 2mm; margin: 2mm 0; font-size: 8px; border-left: 2mm solid #28a745; }
        .disclaimer { background: #fff3cd; padding: 3mm; margin: 3mm 0; font-size: 7px; line-height: 1.4; border-left: 2mm solid #ffc107; }
        .disclaimer h4 { font-size: 9px; margin-bottom: 2mm; color: #856404; }
        .footer-contact { position: absolute; bottom: 0; left: 0; right: 0; width: 210mm; background: linear-gradient(135deg, rgba(255, 107, 107, 0.85) 0%, rgba(238, 90, 111, 0.85) 100%); padding: 4mm 10mm; display: flex; justify-content: space-between; color: white; font-size: 8.5px; line-height: 1.5; }
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
    <div class="page2">
        <div class="header-simple">
            <img src="https://i.imgur.com/GCOPBN1.png" alt="Logo" class="header-logo">
            <img src="https://i.imgur.com/Wsv3Ah2.png" alt="Corner" class="header-corner">
        </div>
        <div class="section-title">MOTOR INSURANCE COMPARISON</div>
        <div class="vehicle-info">
            <strong>Vehicle: ${sortedQuotes[0].make} ${sortedQuotes[0].model} (${sortedQuotes[0].year})</strong><br>
            Value: ${sortedQuotes[0].value} | Repair: ${sortedQuotes[0].repairType}
        </div>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>BENEFITS</th>
                    ${sortedQuotes.map((q, i) => `
                        <th>
                            ${i === 0 ? '<div style="background: #28a745; padding: 0.5mm 1mm; border-radius: 1mm; font-size: 6px; margin-bottom: 1mm;">BEST</div>' : ''}
                            <div style="font-size: 7px; margin-bottom: 1mm;">${q.company.length > 30 ? q.company.substring(0, 27) + '...' : q.company}</div>
                            <div style="font-size: 9px; font-weight: bold;">AED ${q.total.toLocaleString()}</div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                ${allCoverageOptions.map(option => `
                    <tr>
                        <td>${option}</td>
                        ${sortedQuotes.map(q => {
                            const inc = q.coverageOptions.includes(option);
                            return `<td class="${inc ? 'included' : 'not-included'}">${inc ? 'Yes' : 'No'}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
                ${sortedQuotes[0].lossOrDamage > 0 ? `
                <tr>
                    <td>Loss/Damage</td>
                    ${sortedQuotes.map(q => `<td>AED ${q.lossOrDamage.toLocaleString()}</td>`).join('')}
                </tr>
                ` : ''}
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
            </tbody>
        </table>
        ${quotes.length > 1 ? `
        <div class="summary-box">
            <strong>Best:</strong> ${sortedQuotes[0].company} - AED ${sortedQuotes[0].total.toLocaleString()} | 
            <strong>Save:</strong> AED ${(sortedQuotes[sortedQuotes.length - 1].total - sortedQuotes[0].total).toLocaleString()}
        </div>
        ` : ''}
        <div class="disclaimer">
            <h4>Disclaimer</h4>
            <p>While we make every effort to ensure the accuracy and timeliness of the details provided in the comparison table, there may be instances where the actual coverage differs. In such cases, the terms outlined in the insurer's official policy wording and schedule will take precedence over the information provided by us.</p>
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
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NSIB_Insurance_Comparison_${sortedQuotes[0].make}_${sortedQuotes[0].model}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Document downloaded!');
  };

  const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
  const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Add Quote</h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Vehicle Information</h3>
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

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Year Model</label>
              <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.yearModel} onChange={(e) => setFormData({ ...formData, yearModel: e.target.value })}>
                <option value="">Select Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Value</label>
              <input type="text" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="e.g., AED 85,000" value={formData.vehicleValue} onChange={(e) => setFormData({ ...formData, vehicleValue: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-gray-800">Repair Type</label>
            <select className="w-full p-2 border rounded text-sm text-gray-900 bg-white" value={formData.repairType} onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}>
              <option value="">Select Type</option>
              <option value="Agency">Agency</option>
              <option value="Non-Agency">Non-Agency</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Quote Details</h3>
          
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
            <label className="block text-xs font-bold mb-1 text-gray-800">Loss or Damage Coverage</label>
            <input type="number" className="w-full p-2 border rounded text-sm text-gray-900 bg-white" placeholder="Amount in AED" value={formData.lossOrDamage || ''} onChange={(e) => setFormData({ ...formData, lossOrDamage: parseFloat(e.target.value) || 0 })} />
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
                    <div className="text-xs text-gray-600">AED {quote.total.toLocaleString()}</div>
                  </div>
                  <button onClick={() => removeQuote(quote.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button onClick={saveToHistory} className="w-full bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700 transition mb-2">
              Save to History
            </button>
            <button onClick={generateDocument} className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 transition">
              Generate Document
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
              <h3 className="font-bold text-base mb-1 text-gray-900">Vehicle: {sortedQuotes[0].make} {sortedQuotes[0].model} ({sortedQuotes[0].year})</h3>
              <p className="text-sm text-gray-600">Value: {sortedQuotes[0].value} | Repair: {sortedQuotes[0].repairType}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="bg-indigo-600 text-white p-3 border text-left w-44">BENEFITS</th>
                    {sortedQuotes.map((q, i) => (
                      <th key={q.id} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 border text-center">
                        {i === 0 && (<div className="bg-green-500 px-2 py-1 rounded text-xs mb-1 inline-block">BEST PRICE</div>)}
                        <div className="text-xs mb-1">{q.company.substring(0, 25)}</div>
                        <div className="text-sm font-bold">AED {q.total.toLocaleString()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCoverageOptions.map(option => (
                    <tr key={option}>
                      <td className="p-2 border font-bold bg-gray-50 text-gray-900">{option}</td>
                      {sortedQuotes.map(q => {
                        const included = q.coverageOptions.includes(option);
                        return (
                          <td key={q.id} className={`p-2 border text-center font-bold ${included ? 'text-green-600' : 'text-red-600'}`}>
                            {included ? 'Yes' : 'No'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {sortedQuotes[0].lossOrDamage > 0 && (
                    <tr>
                      <td className="p-2 border font-bold bg-gray-50 text-gray-900">Loss/Damage</td>
                      {sortedQuotes.map(q => (
                        <td key={q.id} className="p-2 border text-center text-gray-900">AED {q.lossOrDamage.toLocaleString()}</td>
                      ))}
                    </tr>
                  )}
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
                </tbody>
              </table>
            </div>

            {quotes.length > 1 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mt-4 border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-2">Summary</h4>
                <p className="text-sm text-gray-900"><strong>Best:</strong> {sortedQuotes[0].company} - AED {sortedQuotes[0].total.toLocaleString()}</p>
                <p className="text-sm text-gray-900"><strong>Save:</strong> AED {(sortedQuotes[sortedQuotes.length-1].total - sortedQuotes[0].total).toLocaleString()} vs highest</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============ SAVED HISTORY PAGE ============
function SavedHistoryPage() {
  const [history, setHistory] = useState<SavedComparison[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<SavedComparison | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    yearModel: '',
    vehicleValue: '',
    repairType: '',
    insuranceCompany: '',
    lossOrDamage: 0,
    excess: 0,
    premium: 0,
  });
  const [selectedCoverage, setSelectedCoverage] = useState<string[]>([]);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = JSON.parse(localStorage.getItem('quotesHistory') || '[]');
    setHistory(saved);
  };

  const viewComparison = (comparison: SavedComparison) => {
    setSelectedComparison(comparison);
    setEditingQuote(null);
  };

  const deleteComparison = (id: string) => {
    if (!confirm('Delete this entire comparison? This cannot be undone.')) return;
    
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('quotesHistory', JSON.stringify(updated));
    setHistory(updated);
    if (selectedComparison?.id === id) setSelectedComparison(null);
  };

  const startEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      vehicleMake: quote.make,
      vehicleModel: quote.model,
      yearModel: quote.year === 'Not specified' ? '' : quote.year,
      vehicleValue: quote.value === 'Not specified' ? '' : quote.value,
      repairType: quote.repairType === 'Not specified' ? '' : quote.repairType,
      insuranceCompany: quote.company,
      lossOrDamage: quote.lossOrDamage,
      excess: quote.excess,
      premium: quote.premium,
    });
    setSelectedCoverage(quote.coverageOptions);
    setVat(quote.vat);
    setTotal(quote.total);
  };

  const handlePremiumChange = (premium: number) => {
    const { vat: calculatedVat, total: calculatedTotal } = calculateVAT(premium);
    setVat(calculatedVat);
    setTotal(calculatedTotal);
    setFormData({ ...formData, premium });
  };

  const handleCoverageToggle = (label: string) => {
    setSelectedCoverage(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const saveEdit = () => {
    if (!editingQuote || !selectedComparison) return;
    if (!formData.vehicleMake || !formData.vehicleModel || !formData.insuranceCompany || !formData.premium) {
      alert('Please fill required fields');
      return;
    }

    const updatedQuote: Quote = {
      ...editingQuote,
      make: formData.vehicleMake,
      model: formData.vehicleModel,
      year: formData.yearModel || 'Not specified',
      value: formData.vehicleValue || 'Not specified',
      repairType: formData.repairType || 'Not specified',
      company: formData.insuranceCompany,
      lossOrDamage: formData.lossOrDamage,
      coverageOptions: selectedCoverage,
      excess: formData.excess,
      premium: formData.premium,
      vat,
      total,
    };

    const updatedHistory = history.map(h => {
      if (h.id === selectedComparison.id) {
        const updatedQuotes = h.quotes.map(q => q.id === editingQuote.id ? updatedQuote : q);
        return {
          ...h,
          quotes: updatedQuotes,
          vehicle: `${updatedQuote.make} ${updatedQuote.model}`,
        };
      }
      return h;
    });

    localStorage.setItem('quotesHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    
    const updated = updatedHistory.find(h => h.id === selectedComparison.id);
    if (updated) setSelectedComparison(updated);
    setEditingQuote(null);
    alert('Quote updated!');
  };

  const deleteQuote = (quoteId: string) => {
    if (!confirm('Remove this quote?') || !selectedComparison) return;

    const updatedHistory = history.map(h => {
      if (h.id === selectedComparison.id) {
        const updatedQuotes = h.quotes.filter(q => q.id !== quoteId);
        if (updatedQuotes.length === 0) return null;
        return { ...h, quotes: updatedQuotes };
      }
      return h;
    }).filter((h): h is SavedComparison => h !== null);

    localStorage.setItem('quotesHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    
    const updated = updatedHistory.find(h => h.id === selectedComparison.id);
    if (updated) {
      setSelectedComparison(updated);
    } else {
      setSelectedComparison(null);
    }
    
    if (editingQuote?.id === quoteId) setEditingQuote(null);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Saved Comparisons</h2>
        
        {history.length === 0 ? (
          <div className="text-center text-gray-400 italic py-20">
            No saved comparisons yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(comparison => (
              <div key={comparison.id} className={`bg-gray-50 p-4 rounded-lg border-2 cursor-pointer transition ${selectedComparison?.id === comparison.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`} onClick={() => viewComparison(comparison)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-gray-900">{comparison.vehicle}</div>
                    <div className="text-xs text-gray-500">{formatDate(comparison.date)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteComparison(comparison.id); }} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                    Delete
                  </button>
                </div>
                <div className="text-sm text-gray-600">{comparison.quotes.length} quotes</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-auto">
        {!selectedComparison ? (
          <div className="text-center text-gray-400 italic py-20">
            Select a comparison to view and edit
          </div>
        ) : editingQuote ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Quote</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
              <p className="text-sm font-bold text-yellow-800">Editing: {editingQuote.company}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-sm mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Make *</label>
                  <select className="w-full p-2 border rounded text-sm" value={formData.vehicleMake} onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}>
                    <option value="">Select</option>
                    {VEHICLE_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Model *</label>
                  <input type="text" className="w-full p-2 border rounded text-sm" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Year</label>
                  <select className="w-full p-2 border rounded text-sm" value={formData.yearModel} onChange={(e) => setFormData({ ...formData, yearModel: e.target.value })}>
                    <option value="">Select</option>
                    {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Value</label>
                  <input type="text" className="w-full p-2 border rounded text-sm" value={formData.vehicleValue} onChange={(e) => setFormData({ ...formData, vehicleValue: e.target.value })} />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Repair Type</label>
                <select className="w-full p-2 border rounded text-sm" value={formData.repairType} onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Agency">Agency</option>
                  <option value="Non-Agency">Non-Agency</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Insurance Company *</label>
                <select className="w-full p-2 border rounded text-sm" value={formData.insuranceCompany} onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}>
                  <option value="">Select</option>
                  {INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Coverage Options</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {COVERAGE_OPTIONS.map(option => (
                    <label key={option.id} className="flex items-center gap-2 p-2 bg-white rounded text-xs cursor-pointer hover:bg-gray-100">
                      <input type="checkbox" checked={selectedCoverage.includes(option.label)} onChange={() => handleCoverageToggle(option.label)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Excess</label>
                  <input type="number" className="w-full p-2 border rounded text-sm" value={formData.excess || ''} onChange={(e) => setFormData({ ...formData, excess: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Premium *</label>
                  <input type="number" className="w-full p-2 border rounded text-sm" value={formData.premium || ''} onChange={(e) => handlePremiumChange(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold mb-1">VAT (5%)</label>
                  <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100" value={vat} readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Total</label>
                  <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100 font-bold text-indigo-600" value={total} readOnly />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700">
                  Save Changes
                </button>
                <button onClick={() => setEditingQuote(null)} className="flex-1 bg-gray-500 text-white p-2 rounded-lg font-bold hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">{selectedComparison.vehicle}</h2>
            <p className="text-sm text-gray-500 mb-4">{formatDate(selectedComparison.date)}</p>

            <div className="space-y-3">
              {selectedComparison.quotes.map(quote => {
                const sortedQuotes = [...selectedComparison.quotes].sort((a, b) => a.total - b.total);
                const isBest = quote.id === sortedQuotes[0].id;
                
                return (
                  <div key={quote.id} className={`p-4 rounded-lg border-2 ${isBest ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        {isBest && <div className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mb-1 font-bold">BEST PRICE</div>}
                        <div className="font-bold text-indigo-600 text-base">{quote.company}</div>
                        <div className="text-sm text-gray-700">{quote.make} {quote.model} ({quote.year})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">AED {quote.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Premium: {quote.premium.toLocaleString()} + VAT: {quote.vat.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-gray-700">
                      <div><span className="font-bold text-gray-800">Value:</span> {quote.value}</div>
                      <div><span className="font-bold text-gray-800">Repair:</span> {quote.repairType}</div>
                      <div><span className="font-bold text-gray-800">Excess:</span> AED {quote.excess.toLocaleString()}</div>
                      {quote.lossOrDamage > 0 && <div><span className="font-bold text-gray-800">Coverage:</span> AED {quote.lossOrDamage.toLocaleString()}</div>}
                    </div>

                    {quote.coverageOptions.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-bold mb-1 text-gray-800">Coverage Options:</div>
                        <div className="flex flex-wrap gap-1">
                          {quote.coverageOptions.map((opt, i) => (
                            <span key={i} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-medium">{opt}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(quote)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700">
                        Edit Quote
                      </button>
                      <button onClick={() => deleteQuote(quote.id)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedComparison.quotes.length > 1 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mt-4 border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-2">Summary</h4>
                {(() => {
                  const sorted = [...selectedComparison.quotes].sort((a, b) => a.total - b.total);
                  return (
                    <>
                      <p className="text-sm"><strong>Best:</strong> {sorted[0].company} - AED {sorted[0].total.toLocaleString()}</p>
                      <p className="text-sm"><strong>Save:</strong> AED {(sorted[sorted.length-1].total - sorted[0].total).toLocaleString()} vs highest</p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN APP ============
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
              Quote Generator
            </button>
            <button 
              onClick={() => setCurrentPage('history')} 
              className={`px-8 py-3 rounded-lg font-bold transition ${currentPage === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Saved History
            </button>
          </div>
        </div>

        {currentPage === 'generator' ? <QuoteGeneratorPage /> : <SavedHistoryPage />}
      </div>
    </div>
  );
}
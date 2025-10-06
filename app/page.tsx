import { useState, useEffect } from 'react';

// ============ CONSTANTS ============
const VEHICLE_MAKES = ['Toyota', 'Nissan', 'Hyundai', 'Mercedes-Benz', 'BMW', 'Audi', 'Honda', 'Ford', 'Lexus', 'Volkswagen', 'Chevrolet', 'Kia', 'Land Rover', 'Porsche', 'Mazda', 'Mitsubishi'];

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012'];

const INSURANCE_COMPANIES = [
  'AXA INSURANCE (GULF) B.S.C.(C)',
  'DUBAI INSURANCE CO. PSC',
  'Liva Insurance',
  'UNITED FIDELITY INSURANCE COMPANY PSC',
  'EMIRATES INSURANCE CO. (PSC)',
  'TAKAFUL EMARAT',
  'AL SAGR NATIONAL INSURANCE COMPANY',
  'QATAR INSURANCE COMPANY',
  'ORIENT INSURANCE PJSC',
  'ABU DHABI NATIONAL INSURANCE COMPANY'
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

const getCoverageDefaults = (company) => {
  const defaults = {
    'UNITED FIDELITY INSURANCE COMPANY PSC': ['Natural Calamities Riot and strike', 'Emergency medical expenses', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'EMIRATES INSURANCE CO. (PSC)': ['Passengers Cover', 'Optional Covers Driver Cover', 'Natural Calamities Riot and strike', 'Oman Cover (Own damage only)'],
    'Liva Insurance': ['Oman Cover (Own damage only)', 'Natural Calamities Riot and strike', 'Excess for windscreen damage', '24 Hour Accident and Breakdown Recovery', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'AXA INSURANCE (GULF) B.S.C.(C)': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Emergency medical expenses', '24 Hour Accident and Breakdown Recovery'],
    'DUBAI INSURANCE CO. PSC': ['Fire and theft cover', 'Natural Calamities Riot and strike', 'Passengers Cover', 'Optional Covers Driver Cover'],
    'TAKAFUL EMARAT': ['Natural Calamities Riot and strike', 'Emergency medical expenses', 'Oman Cover (Own damage only)', '24 Hour Accident and Breakdown Recovery'],
  };
  return defaults[company] || [];
};

const calculateVAT = (premium) => {
  const vat = Math.round(premium * 0.05);
  return { vat, total: premium + vat };
};

export default function ComparisonPage() {
  const [quotes, setQuotes] = useState([]);
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
  const [selectedCoverage, setSelectedCoverage] = useState([]);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  // Load saved quotes from localStorage
  useEffect(() => {
    const savedQuotes = localStorage.getItem('insuranceQuotes');
    if (savedQuotes) {
      try {
        setQuotes(JSON.parse(savedQuotes));
      } catch (error) {
        console.error('Error loading saved quotes:', error);
      }
    }
  }, []);

  // Auto-save quotes to localStorage
  useEffect(() => {
    if (quotes.length > 0) {
      localStorage.setItem('insuranceQuotes', JSON.stringify(quotes));
    } else {
      localStorage.removeItem('insuranceQuotes');
    }
  }, [quotes]);

  const handlePremiumChange = (premium) => {
    const { vat: calculatedVat, total: calculatedTotal } = calculateVAT(premium);
    setVat(calculatedVat);
    setTotal(calculatedTotal);
    setFormData({ ...formData, premium });
  };

  const handleCompanyChange = (company) => {
    setFormData({ ...formData, insuranceCompany: company });
    const defaults = getCoverageDefaults(company);
    setSelectedCoverage(defaults);
  };

  const handleCoverageToggle = (label) => {
    setSelectedCoverage(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const addQuote = () => {
    if (!formData.vehicleMake || !formData.vehicleModel || !formData.insuranceCompany || !formData.premium) {
      alert('Please fill required fields');
      return;
    }

    if (editingQuoteId) {
      // Update existing quote
      const updatedQuotes = quotes.map(q => 
        q.id === editingQuoteId ? {
          ...q,
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
        } : q
      );
      setQuotes(updatedQuotes);
      setEditingQuoteId(null);
      clearForm();
      alert('Quote updated successfully!');
      return;
    }

    // Add new quote
    const existingIndex = quotes.findIndex(q => q.company === formData.insuranceCompany);
    if (existingIndex !== -1) {
      if (!confirm(`Quote for ${formData.insuranceCompany} already exists. Replace it?`)) {
        return;
      }
      const newQuotes = [...quotes];
      newQuotes.splice(existingIndex, 1);
      setQuotes(newQuotes);
    }

    const newQuote = {
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
    alert('Quote added successfully!');
  };

  const editQuote = (quote) => {
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
    setEditingQuoteId(quote.id);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingQuoteId(null);
    clearForm();
  };

  const clearForm = () => {
    setFormData({
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
    setSelectedCoverage([]);
    setVat(0);
    setTotal(0);
  };

  const removeQuote = (id) => {
    if (confirm('Are you sure you want to remove this quote?')) {
      setQuotes(quotes.filter(q => q.id !== id));
      if (editingQuoteId === id) {
        setEditingQuoteId(null);
        clearForm();
      }
    }
  };

  const clearAllQuotes = () => {
    if (confirm('This will clear all saved quotes. Are you sure?')) {
      setQuotes([]);
      localStorage.removeItem('insuranceQuotes');
      setEditingQuoteId(null);
      clearForm();
    }
  };

  const addDemoData = () => {
    const demoQuotes = [
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
    alert('Demo data added successfully!');
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

    alert('Document generated! Open the HTML file and print to PDF (Ctrl+P) if needed.');
  };

  const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
  const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-5">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">NSIB Insurance Quote Comparison</h1>
          <p className="text-gray-600">Compare motor insurance quotes from multiple providers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
          <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-center mb-5 text-gray-800">
              {editingQuoteId ? 'Edit Quote' : 'Motor Insurance Quote System'}
            </h2>

            {editingQuoteId && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
                <p className="text-sm text-yellow-800 font-bold">Editing Mode</p>
                <p className="text-xs text-yellow-700">Modify the quote and click Update Quote</p>
              </div>
            )}

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
                {editingQuoteId ? 'Update Quote' : 'Add Quote'}
              </button>
              
              {editingQuoteId && (
                <button onClick={cancelEdit} className="w-full bg-gray-500 text-white p-2 rounded-lg font-bold hover:bg-gray-600 transition mb-2">
                  Cancel Edit
                </button>
              )}
              
              {!editingQuoteId && (
                <button onClick={addDemoData} className="w-full bg-yellow-500 text-gray-900 p-2 rounded-lg font-bold hover:bg-yellow-600 transition">
                  Add Demo Data
                </button>
              )}
            </div>

            {quotes.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-green-800 mb-2">Added Quotes ({quotes.length})</h4>
                <div className="space-y-2 mb-3">
                  {quotes.map(quote => (
                    <div key={quote.id} className={`bg-white p-2 rounded flex justify-between items-center ${editingQuoteId === quote.id ? 'border-l-4 border-yellow-500' : 'border-l-4 border-indigo-600'}`}>
                      <div className="flex-1">
                        <div className="font-bold text-xs text-indigo-600">{quote.company}</div>
                        <div className="text-xs text-gray-600">{quote.make} {quote.model} - AED {quote.total.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editQuote(quote)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                          Edit
                        </button>
                        <button onClick={() => removeQuote(quote.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={clearAllQuotes} className="w-full bg-red-500 text-white p-2 rounded-lg font-bold hover:bg-red-600 transition">
                  Clear All Quotes
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-120px)] overflow-auto">
            <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Insurance Comparison Table</h2>
            
            {sortedQuotes.length === 0 ? (
              <div className="text-center text-gray-400 italic py-20">Add insurance quotes from different companies to generate comparison table</div>
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
                            <div className="text-xs mb-1">{q.company}</div>
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
                          <td className="p-2 border font-bold bg-gray-50 text-gray-900">Loss/Damage Coverage</td>
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
                    <h4 className="font-bold text-green-800 mb-2">Comparison Summary</h4>
                    <p className="text-sm text-gray-900"><strong>Best Deal:</strong> {sortedQuotes[0].company} - AED {sortedQuotes[0].total.toLocaleString()}</p>
                    <p className="text-sm text-gray-900"><strong>You Save:</strong> AED {(sortedQuotes[sortedQuotes.length-1].total - sortedQuotes[0].total).toLocaleString()} vs highest quote</p>
                    <p className="text-sm text-gray-900"><strong>Companies Compared:</strong> {quotes.length}</p>
                  </div>
                )}

                <button onClick={generateDocument} className="w-full mt-4 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
                  Generate Document
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
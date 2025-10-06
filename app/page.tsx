// app/page.tsx
'use client';

import { useState } from 'react';
import { Quote, VEHICLE_MAKES, YEARS, INSURANCE_COMPANIES, COVERAGE_OPTIONS } from '@/types/quote';
import { getCoverageDefaults, calculateVAT } from '@/utils/coverageDefaults';

export default function ComparisonPage() {
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

    const existingIndex = quotes.findIndex(q => q.company === formData.insuranceCompany);
    if (existingIndex !== -1) {
      if (!confirm(`Quote for ${formData.insuranceCompany} already exists. Replace it?`)) {
        return;
      }
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
    alert('Quote added successfully!');
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

  const clearAllQuotes = () => {
    setQuotes([]);
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
    alert('Demo data added successfully!');
  };

  const generateDocument = () => {
    alert('Document generation feature - This will generate a downloadable HTML/PDF document');
  };

  const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
  const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
      {/* Form Panel */}
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-120px)] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Motor Insurance Quote System</h2>

        {/* Vehicle Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Make *</label>
              <select
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
              >
                <option value="">Select Make</option>
                {VEHICLE_MAKES.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Model *</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                placeholder="e.g., Camry"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Year Model</label>
              <select
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                value={formData.yearModel}
                onChange={(e) => setFormData({ ...formData, yearModel: e.target.value })}
              >
                <option value="">Select Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Vehicle Value</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                placeholder="e.g., AED 85,000"
                value={formData.vehicleValue}
                onChange={(e) => setFormData({ ...formData, vehicleValue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-gray-800">Repair Type</label>
            <select
              className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
              value={formData.repairType}
              onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="Agency">Agency</option>
              <option value="Non-Agency">Non-Agency</option>
            </select>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Quote Details</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Insurance Company *</label>
            <select
              className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
              value={formData.insuranceCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              <option value="">Select Company</option>
              {INSURANCE_COMPANIES.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Loss or Damage Coverage</label>
            <input
              type="number"
              className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
              placeholder="Amount in AED"
              value={formData.lossOrDamage || ''}
              onChange={(e) => setFormData({ ...formData, lossOrDamage: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 text-gray-800">Coverage Options</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {COVERAGE_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-2 p-2 bg-white rounded text-xs cursor-pointer hover:bg-gray-100 text-gray-800">
                  <input
                    type="checkbox"
                    checked={selectedCoverage.includes(option.label)}
                    onChange={() => handleCoverageToggle(option.label)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Excess</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                placeholder="1000"
                value={formData.excess || ''}
                onChange={(e) => setFormData({ ...formData, excess: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Premium *</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                placeholder="2500"
                value={formData.premium || ''}
                onChange={(e) => handlePremiumChange(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">VAT (5%)</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-900"
                value={vat}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-800">Total Amount</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm bg-gray-100 font-bold text-indigo-600"
                value={total}
                readOnly
              />
            </div>
          </div>

          <button
            onClick={addQuote}
            className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-700 transition mb-2"
          >
            Add Quote
          </button>
          <button
            onClick={addDemoData}
            className="w-full bg-yellow-500 text-gray-900 p-2 rounded-lg font-bold hover:bg-yellow-600 transition"
          >
            Add Demo Data
          </button>
        </div>

        {/* Added Quotes */}
        {quotes.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-green-800 mb-2">
              Added Quotes ({quotes.length})
            </h4>
            <div className="space-y-2 mb-3">
              {quotes.map(quote => (
                <div key={quote.id} className="bg-white p-2 rounded flex justify-between items-center border-l-4 border-indigo-600">
                  <div>
                    <div className="font-bold text-xs text-indigo-600">{quote.company}</div>
                    <div className="text-xs text-gray-600">{quote.make} {quote.model} - AED {quote.total.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => removeQuote(quote.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={clearAllQuotes}
              className="w-full bg-red-500 text-white p-2 rounded-lg font-bold hover:bg-red-600 transition"
            >
              Clear All Quotes
            </button>
          </div>
        )}
      </div>

      {/* Comparison Panel */}
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-120px)] overflow-auto">
        <h2 className="text-xl font-bold text-center mb-5 text-gray-800">Insurance Comparison Table</h2>
        
        {sortedQuotes.length === 0 ? (
          <div className="text-center text-gray-400 italic py-20">
            Add insurance quotes from different companies to generate comparison table
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center border-l-4 border-indigo-600">
              <h3 className="font-bold text-base mb-1 text-gray-900">
                Vehicle: {sortedQuotes[0].make} {sortedQuotes[0].model} ({sortedQuotes[0].year})
              </h3>
              <p className="text-sm text-gray-600">
                Value: {sortedQuotes[0].value} | Repair: {sortedQuotes[0].repairType}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="bg-indigo-600 text-white p-3 border text-left w-44">BENEFITS</th>
                    {sortedQuotes.map((q, i) => (
                      <th key={q.id} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 border text-center">
                        {i === 0 && (
                          <div className="bg-green-500 px-2 py-1 rounded text-xs mb-1 inline-block">BEST PRICE</div>
                        )}
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

            <button
              onClick={generateDocument}
              className="w-full mt-4 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Generate Document
            </button>
          </>
        )}
      </div>
    </div>
  );
}
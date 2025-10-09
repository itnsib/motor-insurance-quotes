// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

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

// Generate unique 6-digit reference number using timestamp + random
const generateReferenceNumber = (): string => {
  const timestamp = Date.now();
  const last4 = timestamp.toString().slice(-4);
  const random2 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${last4}${random2}`;
};

// Google Drive Integration
const FOLDER_NAME = 'Motor Insurance Comparison Documents';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInitialized = false;
let tokenClient: any = null;

const initializeGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiInitialized) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          
          const gisScript = document.createElement('script');
          gisScript.src = 'https://accounts.google.com/gsi/client';
          gisScript.async = true;
          gisScript.defer = true;
          gisScript.onload = () => {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: CLIENT_ID,
              scope: SCOPES,
              callback: '',
            });
            gapiInitialized = true;
            resolve();
          };
          document.body.appendChild(gisScript);
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const authenticateGoogleDrive = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google API not initialized'));
      return;
    }

    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      resolve(response.access_token);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const getOrCreateFolder = async (folderName: string): Promise<string> => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    return folder.result.id;
  } catch (error) {
    console.error('Error creating/finding folder:', error);
    throw error;
  }
};

const uploadToGoogleDrive = async (fileName: string, htmlContent: string): Promise<string> => {
  try {
    await initializeGoogleDrive();
    await authenticateGoogleDrive();

    const folderId = await getOrCreateFolder(FOLDER_NAME);

    const file = new Blob([htmlContent], { type: 'text/html' });
    const metadata = {
      name: fileName,
      mimeType: 'text/html',
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer ' + window.gapi.client.getToken().access_token }),
      body: form,
    });

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

// Helper function to generate HTML content
function generateHTMLContentHelper(sortedQuotes: Quote[], allCoverageOptions: string[], referenceNumber: string, advisorComment: string): string {
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
        .page2 { width: 210mm; height: 297mm; padding: 8mm 10mm 35mm 10mm; page-break-after: always; position: relative; }
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
        .advisor-comment { background: #fff3cd; padding: 3mm; margin: 3mm 0; font-size: 9px; line-height: 1.4; border-left: 2mm solid #ffc107; }
        .advisor-comment h4 { font-size: 11px; margin-bottom: 2mm; color: #856404; }
        .disclaimer { background: #fff3cd; padding: 3mm; margin: 3mm 0; font-size: 8px; line-height: 1.4; border-left: 2mm solid #ffc107; }
        .disclaimer h4 { font-size: 10px; margin-bottom: 2mm; color: #856404; }
        .footer-contact { position: absolute; bottom: 0; left: 0; right: 0; width: 210mm; background: linear-gradient(135deg, rgba(255, 107, 107, 0.85) 0%, rgba(238, 90, 111, 0.85) 100%); padding: 4mm 10mm; display: flex; justify-content: space-between; color: white; font-size: 9px; line-height: 1.5; }
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
                    <td>Renewal</td>
                    ${sortedQuotes.map(q => `<td class="${q.isRenewal ? 'included' : ''}">${q.isRenewal ? 'YES' : ''}</td>`).join('')}
                </tr>
                <tr>
                    <td>Best</td>
                    ${sortedQuotes.map(q => `<td class="${q.isBest ? 'included' : ''}">${q.isBest ? 'YES' : ''}</td>`).join('')}
                </tr>
            </tbody>
        </table>
        ${advisorComment ? `
        <div class="advisor-comment">
            <h4>Advisor Comment</h4>
            <p>${advisorComment}</p>
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
}

// ============ QUOTE GENERATOR PAGE ============
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
      const savedHistory = JSON.parse(localStorage.getItem('quotesHistory') || '[]');
      
      const newComparison: SavedComparison = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        vehicle: `${quotes[0].make} ${quotes[0].model}`,
        quotes: quotes,
        advisorComment: advisorComment,
        referenceNumber: referenceNumber,
      };

      savedHistory.unshift(newComparison);
      localStorage.setItem('quotesHistory', JSON.stringify(savedHistory));
      
      const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
      const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];
      
      const htmlContent = generateHTMLContentHelper(sortedQuotes, allCoverageOptions, referenceNumber, advisorComment);
      const fileName = `NSIB_${quotes[0].customerName}_${quotes[0].make}_${quotes[0].model}_${referenceNumber}.html`;
      
      alert('Uploading to Google Drive... Please sign in if prompted.');
      await uploadToGoogleDrive(fileName, htmlContent);
      
      alert(`✅ Success!\n\n📁 Saved to Google Drive folder: "${FOLDER_NAME}"\n📄 File: ${fileName}\n\nYou can view it in the History tab.`);
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('⚠️ Saved locally but failed to upload to Google Drive. Please try again or check your Google account permissions.');
    }
  };

  const generateDocument = () => {
    if (quotes.length === 0) return;

    const sortedQuotes = [...quotes].sort((a, b) => a.total - b.total);
    const allCoverageOptions = [...new Set(quotes.flatMap(q => q.coverageOptions))];
    const referenceNumber = generateReferenceNumber();

    const htmlContent = generateHTMLContentHelper(sortedQuotes, allCoverageOptions, referenceNumber, advisorComment);

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
      {/* Form Panel - Continue with your existing JSX */}
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-y-auto">
        {/* ... rest of your form code ... */}
      </div>
      
      {/* Comparison Panel - Continue with your existing JSX */}
      <div className="bg-white rounded-xl p-5 shadow-2xl max-h-[calc(100vh-150px)] overflow-auto">
        {/* ... rest of your comparison code ... */}
      </div>
    </div>
  );
}

// ============ SAVED HISTORY PAGE ============
function SavedHistoryPage() {
  const [history, setHistory] = useState<SavedComparison[]>([]);

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

  const downloadComparison = (comparison: SavedComparison) => {
    const sortedQuotes = [...comparison.quotes].sort((a, b) => a.total - b.total);
    const allCoverageOptions = [...new Set(comparison.quotes.flatMap(q => q.coverageOptions))];
    
    const htmlContent = generateHTMLContentHelper(sortedQuotes, allCoverageOptions, comparison.referenceNumber, comparison.advisorComment || '');
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NSIB_${comparison.vehicle.replace(/ /g, '_')}_${comparison.referenceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    <div className="grid grid-cols-1 gap-5">
      <div className="bg-white rounded-xl p-5 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Saved History</h2>
        <p className="text-sm text-gray-600 mb-4">📁 All comparisons are saved to Google Drive folder: <strong>"Motor Insurance Comparison Documents"</strong></p>
        
        {history.length === 0 ? (
          <div className="text-center text-gray-400 italic py-20">
            No saved comparisons yet. Create a comparison and click "Save to History" to see it here.
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
                      <div key={q.id} className="truncate">• {q.company}</div>
                    ))}
                  </div>
                </div>

                {comparison.advisorComment && (
                  <div className="mb-3 p-2 bg-yellow-50 rounded text-xs text-gray-700 border-l-2 border-yellow-400">
                    <strong>Comment:</strong> {comparison.advisorComment.substring(0, 100)}...
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button onClick={() => downloadComparison(comparison)} className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-green-700 transition">
                    📥 Download
                  </button>
                  <button onClick={() => deleteComparison(comparison.id)} className="bg-red-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-red-700 transition">
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
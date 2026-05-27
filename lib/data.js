// ─── Pure constants — no localStorage, no side effects ────────────────────────
// A backend developer can replace these with real API calls.

export const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

export const EXPENSE_CATEGORIES = [
  'Travel & Transport','Office Supplies','Utilities','Software & Tools',
  'Marketing & Advertising','Meals & Entertainment','Professional Services',
  'Rent & Lease','Salaries & Wages','Insurance','Repairs & Maintenance',
  'Bank Charges','Taxes & Licenses','Miscellaneous',
];

export const PAYMENT_TYPES = ['UPI','Cash','Card','Net Banking','Cheque','EMI','NEFT','RTGS'];

export const UNITS = ['Nos','Pcs','Kg','g','Ltr','ml','Mtr','Cm','Box','Hr','Day','Month','Year','Set','Pair','Dozen','Bundle'];

export const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

export const INVOICE_TEMPLATES = [
  { id: 'modern',    name: 'Modern',           color: '#1e40af' },
  { id: 'vintage',   name: 'Vintage',          color: '#92400e' },
  { id: 'elegant',   name: 'Elegant',          color: '#111827' },
  { id: 'service',   name: 'Service Template', color: '#7c3aed' },
  { id: 'landscape', name: 'Landscape',        color: '#065f46' },
  { id: 'classic',   name: 'Classic',          color: '#1e3a5f' },
  { id: 'compact',   name: 'Compact',          color: '#dc2626' },
  { id: 'genz',      name: 'genZ',             color: '#1d4ed8' },
];

export const HSN_DATA = [
  { code:'84716040', desc:'Mouse',                  category:'Electronics'   },
  { code:'84716030', desc:'Keyboard',               category:'Electronics'   },
  { code:'85285200', desc:'Monitor',                category:'Electronics'   },
  { code:'84716020', desc:'Printer',                category:'Electronics'   },
  { code:'84713010', desc:'Laptop',                 category:'Electronics'   },
  { code:'84715000', desc:'Desktop Computer',       category:'Electronics'   },
  { code:'84717020', desc:'Hard Disk',              category:'Electronics'   },
  { code:'84717030', desc:'SSD',                    category:'Electronics'   },
  { code:'85235100', desc:'Pen Drive',              category:'Electronics'   },
  { code:'85176290', desc:'Router / Switch / Modem',category:'Electronics'   },
  { code:'85171300', desc:'Mobile Phone',           category:'Electronics'   },
  { code:'84713090', desc:'Tablet',                 category:'Electronics'   },
  { code:'85287200', desc:'TV / Display',           category:'Electronics'   },
  { code:'85444200', desc:'LAN Cable',              category:'Electronics'   },
  { code:'84181010', desc:'Refrigerator',           category:'Appliances'    },
  { code:'84501100', desc:'Washing Machine',        category:'Appliances'    },
  { code:'84151010', desc:'Air Conditioner',        category:'Appliances'    },
  { code:'85165000', desc:'Microwave Oven',         category:'Appliances'    },
  { code:'85094000', desc:'Mixer Grinder',          category:'Appliances'    },
  { code:'85164000', desc:'Electric Iron',          category:'Appliances'    },
  { code:'85161000', desc:'Water Heater',           category:'Appliances'    },
  { code:'84145100', desc:'Fan',                    category:'Appliances'    },
  { code:'94017100', desc:'Chair',                  category:'Furniture'     },
  { code:'94036000', desc:'Table',                  category:'Furniture'     },
  { code:'94035000', desc:'Bed',                    category:'Furniture'     },
  { code:'94016100', desc:'Sofa',                   category:'Furniture'     },
  { code:'94032000', desc:'Cupboard',               category:'Furniture'     },
  { code:'61091000', desc:'T-Shirt',                category:'Clothing'      },
  { code:'62052000', desc:'Shirt',                  category:'Clothing'      },
  { code:'62034200', desc:'Jeans',                  category:'Clothing'      },
  { code:'62011300', desc:'Jacket',                 category:'Clothing'      },
  { code:'50079000', desc:'Saree',                  category:'Clothing'      },
  { code:'10063000', desc:'Rice',                   category:'Food'          },
  { code:'10019900', desc:'Wheat',                  category:'Food'          },
  { code:'17019900', desc:'Sugar',                  category:'Food'          },
  { code:'04012000', desc:'Milk',                   category:'Food'          },
  { code:'04031000', desc:'Curd',                   category:'Food'          },
  { code:'04051000', desc:'Butter',                 category:'Food'          },
  { code:'19053100', desc:'Biscuits',               category:'Food'          },
  { code:'96081000', desc:'Pen',                    category:'Stationery'    },
  { code:'96091000', desc:'Pencil',                 category:'Stationery'    },
  { code:'48202000', desc:'Notebook',               category:'Stationery'    },
  { code:'87030010', desc:'Car',                    category:'Automobile'    },
  { code:'87112000', desc:'Motorcycle',             category:'Automobile'    },
  { code:'87120010', desc:'Bicycle',                category:'Automobile'    },
  { code:'87042200', desc:'Truck',                  category:'Automobile'    },
  { code:'25232930', desc:'Cement',                 category:'Construction'  },
  { code:'69010000', desc:'Bricks',                 category:'Construction'  },
  { code:'25051000', desc:'Sand',                   category:'Construction'  },
  { code:'72142000', desc:'Steel Rod',              category:'Construction'  },
  { code:'30049099', desc:'Paracetamol',            category:'Medical'       },
  { code:'90183100', desc:'Syringe',                category:'Medical'       },
  { code:'90251990', desc:'Thermometer',            category:'Medical'       },
  { code:'998311',   desc:'Management Consulting',  category:'Services'      },
  { code:'998313',   desc:'IT Consulting',          category:'Services'      },
  { code:'998314',   desc:'Website Design & Dev',   category:'Services'      },
  { code:'998315',   desc:'Software Development',   category:'Services'      },
  { code:'998361',   desc:'Digital Marketing',      category:'Services'      },
  { code:'998362',   desc:'Social Media Marketing', category:'Services'      },
  { code:'9991',     desc:'Public administration services', category:'Government' },
  { code:'999111',   desc:'Overall Government services',    category:'Government' },
  { code:'999112',   desc:'Public administrative (education, health)', category:'Government' },
  { code:'999113',   desc:'Public administrative (business operations)', category:'Government' },
];

// ─── Calculation helpers (pure functions, no state) ───────────────────────────
export function calcItem(item) {
  const qty   = Math.round(parseFloat(item.qty)   || 0);
  const price = Math.round(parseFloat(item.price) || 0);
  const disc  = parseFloat(item.disc)  || 0;
  const gst   = parseFloat(item.gst)   || 0;
  const base    = qty * price * (1 - disc / 100);
  const gstAmt  = base * gst / 100;
  return { base, gstAmt, total: base + gstAmt };
}

export function calcDoc(items = [], docDisc = 0) {
  let subtotal = 0, taxAmt = 0;
  (items || []).forEach(item => {
    const c = calcItem(item);
    subtotal += c.base;
    taxAmt   += c.gstAmt;
  });
  const disc  = parseFloat(docDisc) || 0;
  return { subtotal, taxAmt, disc, total: subtotal + taxAmt - disc };
}

const CURRENCY_MAP = {
  INR: { symbol: '₹', locale: 'en-IN' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'en-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  AED: { symbol: 'د.إ', locale: 'ar-AE' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  CHF: { symbol: 'CHF', locale: 'de-CH' },
};

// Get currency symbol for a given currency code
export function getCurrencySymbol(code = 'INR') {
  return (CURRENCY_MAP[code] || CURRENCY_MAP.INR).symbol;
}

// Format number with the app's selected currency
// Pass currency code as second arg, or use ₹ as default
export function fmtRs(n, currency = 'INR') {
  const num = parseFloat(n) || 0;
  const { symbol, locale } = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;
  return symbol + num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Legacy alias — kept for backward compat
export function fmtCurrency(n, currency = 'INR') {
  return fmtRs(n, currency);
}

export function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function nextId(arr) {
  if (!arr.length) return 1;
  return Math.max(...arr.map(x => x.id || 0)) + 1;
}

export const SHORTCUTS = [
  { keys:'C + I', action:'Invoice' },
  { keys:'C + P', action:'Purchase Invoice' },
  { keys:'C + O', action:'Purchase Order' },
  { keys:'C + Q', action:'Quotation' },
  { keys:'C + F', action:'Pro Forma Invoice' },
  { keys:'C + D', action:'Delivery Challan' },
  { keys:'C + C', action:'Sales Return' },
  { keys:'C + E', action:'Expense' },
  { keys:'A + C', action:'Customer' },
  { keys:'A + V', action:'Vendor' },
  { keys:'A + P', action:'Product' },
];

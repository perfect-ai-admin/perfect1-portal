// Agreement templates configuration
// Each template maps to a FillFaster form_id (fid)
// Field names MUST match the field labels defined in FillFaster form builder

export const AGREEMENT_TEMPLATES = [
  {
    key: 'close_file',
    label: 'הסכם סגירת תיק',
    fillfaster_form_id: 'TZy1cCklEd',
    description: 'הסכם סגירת תיק לקוח',
    // Fields the agent fills in the dialog (sent as prefill_data)
    agentFields: [
      { name: 'עלות סגירת תיק', label: 'עלות סגירת תיק', type: 'number', placeholder: '₪', required: true },
      { name: 'עלות דוח שנתי', label: 'עלות דוח שנתי', type: 'number', placeholder: '₪', required: true },
    ],
    // Fields auto-filled from CRM lead data
    autoFields: {
      'שם מלא': (lead) => lead.name || '',
      'ת.ז': (lead) => lead.id_number || '',
    },
    // Fields the client fills themselves (not prefilled): מספר כרטיס, תוקף, 3 ספרות
  },
  {
    key: 'accounting_murshe',
    label: 'הסכם הנהלת חשבונות מורשה',
    fillfaster_form_id: 'GfctNMEZS0',
    description: 'הסכם הנהלת חשבונות לעוסק מורשה',
    agentFields: [
      { name: 'עלות פתיחת תיק', label: 'עלות פתיחת תיק', type: 'number', placeholder: '₪', required: true },
      { name: 'הנהלת חשבונות', label: 'הנהלת חשבונות (חודשי)', type: 'number', placeholder: '₪', required: true },
      { name: 'דוח שנתי', label: 'דוח שנתי', type: 'number', placeholder: '₪', required: true },
    ],
    autoFields: {
      'שם מלא': (lead) => lead.name || '',
      'ת.ז': (lead) => lead.id_number || '',
    },
  },
  {
    key: 'employment',
    label: 'הסכם עבודה',
    fillfaster_form_id: 'ActW7DVPne',
    description: 'הסכם עבודה כללי',
    agentFields: [
      { name: 'מחיר פתיחת תיק', label: 'מחיר פתיחת תיק', type: 'number', placeholder: '₪', required: true },
      { name: 'דוח שנתי', label: 'דוח שנתי', type: 'number', placeholder: '₪', required: true },
      { name: 'מחיר ליווי חודשי', label: 'מחיר ליווי חודשי', type: 'number', placeholder: '₪', required: true },
    ],
    autoFields: {
      'שם מלא': (lead) => lead.name || '',
      'ת.ז': (lead) => lead.id_number || '',
    },
  },
];

// Build prefill_data for a specific template from lead + agent input
export function buildPrefillData(template, lead, agentValues = {}) {
  const data = {};

  // Auto-fill from CRM
  if (template.autoFields) {
    for (const [fieldName, getter] of Object.entries(template.autoFields)) {
      const value = getter(lead);
      if (value) data[fieldName] = value;
    }
  }

  // Agent-entered values
  for (const [fieldName, value] of Object.entries(agentValues)) {
    if (value !== undefined && value !== null && value !== '') {
      data[fieldName] = String(value);
    }
  }

  return data;
}

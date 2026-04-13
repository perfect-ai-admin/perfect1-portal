// Agreement templates configuration
// Each template maps to a FillFaster form_id (fid)
// Field names in FIELD_MAPPING must match the field names defined in FillFaster form builder

export const AGREEMENT_TEMPLATES = [
  {
    key: 'close_file',
    label: 'הסכם סגירת תיק',
    fillfaster_form_id: 'TZy1cCklEd',
    description: 'הסכם סגירת תיק לקוח',
  },
  {
    key: 'accounting_murshe',
    label: 'הסכם הנהלת חשבונות מורשה',
    fillfaster_form_id: 'GfctNMEZS0',
    description: 'הסכם הנהלת חשבונות לעוסק מורשה',
  },
  {
    key: 'employment',
    label: 'הסכם עבודה',
    fillfaster_form_id: 'ActW7DVPne',
    description: 'הסכם עבודה כללי',
  },
];

// CRM lead fields → FillFaster prefill_data field names
// These names MUST match the field names configured in FillFaster form builder
export const FIELD_MAPPING = {
  full_name: (lead) => lead.name || '',
  id_number: (lead) => lead.id_number || '',
  phone: (lead) => lead.phone || '',
  email: (lead) => lead.email || '',
  business_name: (lead) => lead.business_name || '',
  city: (lead) => lead.city || '',
  service_name: (lead) => lead.service_type || '',
};

// Build prefill_data object from lead (FillFaster uses prefill_data, not prefilled_data)
export function buildPrefillData(lead, extraFields = {}) {
  const data = {};
  for (const [fieldName, getter] of Object.entries(FIELD_MAPPING)) {
    const value = getter(lead);
    if (value) data[fieldName] = value;
  }
  return { ...data, ...extraFields };
}

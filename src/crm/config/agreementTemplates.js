// Agreement templates — each has fields the agent fills + a FillFaster template link

export const AGREEMENT_TEMPLATES = [
  {
    key: 'close_file',
    label: 'הסכם סגירת תיק',
    fillfaster_form_id: 'TZy1cCklEd',
    template_link: 'https://fillfaster.com/fills/TZy1cCklEd',
    description: 'הסכם סגירת תיק לקוח',
    fields: [
      { name: 'שם מלא', label: 'שם מלא', type: 'text', required: true, autoFill: 'name' },
      { name: 'ת.ז', label: 'ת.ז', type: 'text', required: true, autoFill: 'id_number', maxLength: 9 },
      { name: 'עלות סגירת תיק', label: 'עלות סגירת תיק (₪)', type: 'number', required: true, placeholder: '₪' },
      { name: 'עלות דוח שנתי', label: 'עלות דוח שנתי (₪)', type: 'number', required: true, placeholder: '₪' },
    ],
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם סגירת התיק לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
  {
    key: 'accounting_murshe',
    label: 'הסכם הנהלת חשבונות מורשה',
    fillfaster_form_id: 'GfctNMEZS0',
    template_link: 'https://fillfaster.com/fills/GfctNMEZS0',
    description: 'הסכם הנהלת חשבונות לעוסק מורשה',
    fields: [
      { name: 'שם מלא', label: 'שם מלא', type: 'text', required: true, autoFill: 'name' },
      { name: 'ת.ז', label: 'ת.ז', type: 'text', required: true, autoFill: 'id_number', maxLength: 9 },
      { name: 'עלות פתיחת תיק', label: 'עלות פתיחת תיק (₪)', type: 'number', required: true, placeholder: '₪' },
      { name: 'הנהלת חשבונות', label: 'הנהלת חשבונות חודשי (₪)', type: 'number', required: true, placeholder: '₪' },
      { name: 'דוח שנתי', label: 'דוח שנתי (₪)', type: 'number', required: true, placeholder: '₪' },
    ],
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם הנהלת החשבונות לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
  {
    key: 'employment',
    label: 'הסכם עבודה',
    fillfaster_form_id: 'ActW7DVPne',
    template_link: 'https://fillfaster.com/fills/ActW7DVPne',
    description: 'הסכם עבודה כללי',
    fields: [
      { name: 'שם מלא', label: 'שם מלא', type: 'text', required: true, autoFill: 'name' },
      { name: 'ת.ז', label: 'ת.ז', type: 'text', required: true, autoFill: 'id_number', maxLength: 9 },
      { name: 'מחיר פתיחת תיק', label: 'מחיר פתיחת תיק (₪)', type: 'number', required: true, placeholder: '₪' },
      { name: 'דוח שנתי', label: 'דוח שנתי (₪)', type: 'number', required: true, placeholder: '₪' },
      { name: 'מחיר ליווי חודשי', label: 'מחיר ליווי חודשי (₪)', type: 'number', required: true, placeholder: '₪' },
    ],
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם העבודה לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
];

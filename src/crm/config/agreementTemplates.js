// Agreement templates — each has a fixed FillFaster template link
// No API dependency — links are direct FillFaster form URLs

export const AGREEMENT_TEMPLATES = [
  {
    key: 'close_file',
    label: 'הסכם סגירת תיק',
    fillfaster_form_id: 'TZy1cCklEd',
    template_link: 'https://fillfaster.com/fills/TZy1cCklEd',
    description: 'הסכם סגירת תיק לקוח',
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם סגירת התיק לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
  {
    key: 'accounting_murshe',
    label: 'הסכם הנהלת חשבונות מורשה',
    fillfaster_form_id: 'GfctNMEZS0',
    template_link: 'https://fillfaster.com/fills/GfctNMEZS0',
    description: 'הסכם הנהלת חשבונות לעוסק מורשה',
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם הנהלת החשבונות לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
  {
    key: 'employment',
    label: 'הסכם עבודה',
    fillfaster_form_id: 'ActW7DVPne',
    template_link: 'https://fillfaster.com/fills/ActW7DVPne',
    description: 'הסכם עבודה כללי',
    whatsapp_message: (name, link) =>
      `היי ${name} 👋\n\nמצרף/ה לך את הסכם העבודה לחתימה דיגיטלית:\n${link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`,
  },
];

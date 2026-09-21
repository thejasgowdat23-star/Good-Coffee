const supportName = import.meta.env.VITE_SUPPORT_NAME || 'Thejas';
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE || '8147922985';

export const support = {
  name: supportName,
  phone: supportPhone,
  tel: `tel:+91${supportPhone.replace(/\D/g, '')}`
};

export default support;

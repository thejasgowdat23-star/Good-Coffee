import React from 'react';
import { PhoneCall } from 'lucide-react';
import support from '../config/support';

export default function CustomerSupport() {
  return (
    <section className="customer-support page-shell" aria-labelledby="support-title">
      <div>
        <p className="eyebrow">Here when you need us</p>
        <h2 id="support-title">Need help? Customer Support</h2>
        <p>If you face any issue with your order, please call them.</p>
        <p>Thank you, visit again! ☕</p>
      </div>
      <div className="customer-support__contact">
        <strong>{support.name}</strong>
        <a href={support.tel}>{support.phone}</a>
        <a className="button button--primary" href={support.tel}><PhoneCall size={17} /> Call now</a>
      </div>
    </section>
  );
}

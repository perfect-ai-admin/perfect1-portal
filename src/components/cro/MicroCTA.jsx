import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function MicroCTA({ text = 'רוצה לדעת עוד?', linkTo = 'Contact', buttonText = 'צרו קשר' }) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 text-center my-6">
      <p className="text-[#1E3A5F] font-bold mb-2">{text}</p>
      <Link to={createPageUrl(linkTo)}>
        <Button className="bg-[#1E3A5F] hover:bg-[#2C5282] text-white">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
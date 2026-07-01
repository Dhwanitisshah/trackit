'use client';

import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ExportButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()}>
      <Download className="mr-1.5 h-3.5 w-3.5" />
      Download PDF
    </Button>
  );
}

import React from 'react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ data, size = 200 }) => {
  // Using generic QR server API for MVP simplicity
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <img src={qrUrl} alt={`QR Code for ${data}`} width={size} height={size} className="block" />
      <p className="mt-2 text-xs text-gray-500 font-mono text-center break-all max-w-[200px]">{data}</p>
    </div>
  );
};

export default QRCodeGenerator;

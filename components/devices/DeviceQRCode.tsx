'use client';

import { useState } from 'react';
import { QrCode, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DeviceQRCodeProps {
  serialNumber: string;
  deviceId: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
}

export function DeviceQRCode({
  serialNumber,
  deviceId,
  size = 'md',
  showButton = true,
}: DeviceQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate QR code URL using a free QR API
  const getQRCodeUrl = (qrSize: number = 300) => {
    // Data to encode: device URL that can be scanned from anywhere
    const deviceUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dispositivos/${deviceId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(deviceUrl)}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getQRCodeUrl(600);
    link.download = `QR-${serialNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!showButton) {
    const sizeMap = {
      sm: 80,
      md: 120,
      lg: 200,
    };
    
    return (
      <div className="flex flex-col items-center gap-2">
        <img
          src={getQRCodeUrl(sizeMap[size])}
          alt={`QR Code para ${serialNumber}`}
          className={cn(
            'rounded-lg border',
            size === 'sm' && 'w-20 h-20',
            size === 'md' && 'w-32 h-32',
            size === 'lg' && 'w-48 h-48'
          )}
        />
        <p className="text-xs text-center text-fg-tertiary font-mono">
          {serialNumber}
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <QrCode className="h-4 w-4" />
        Ver QR
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR del Dispositivo</DialogTitle>
            <DialogDescription>
              Escanea este código para acceder rápidamente a la información del dispositivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <img
                src={getQRCodeUrl(300)}
                alt={`QR Code para ${serialNumber}`}
                className="w-64 h-64 rounded-lg"
              />
            </div>

            {/* Serial Number */}
            <div className="text-center">
              <p className="text-sm text-fg-tertiary mb-1">
                Número de serie
              </p>
              <p className="text-lg font-mono font-bold">
                {serialNumber}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-surface-2/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">
                💡 Usos del código QR:
              </p>
              <ul className="text-sm text-fg-tertiary space-y-1 ml-4 list-disc">
                <li>Escanear para identificar dispositivos sin leer el serial</li>
                <li>Imprimir y pegar como etiqueta de respaldo</li>
                <li>Acceso rápido desde dispositivos móviles</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                className="flex-1 gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar QR
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

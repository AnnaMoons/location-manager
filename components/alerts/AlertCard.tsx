'use client';

import Link from 'next/link';
import { MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react';
import { AlertTypeBadge } from './AlertTypeBadge';
import { cn } from '@/lib/utils';
import type { ConfiguredAlert } from '@/lib/types/alert';
import { getVariableInfo } from '@/lib/types/alert';

interface AlertCardProps {
  alert: ConfiguredAlert;
  locationName?: string;
  deviceSerial?: string;
}

export function AlertCard({ alert, locationName, deviceSerial }: AlertCardProps) {
  const varInfo = getVariableInfo(alert.condition.variable);
  const activeChannels = [
    alert.channels.whatsapp.enabled && 'whatsapp',
    alert.channels.email.enabled && 'email',
    alert.channels.sms.enabled && 'sms',
  ].filter(Boolean);

  return (
    <Link
      href={`/alertas/${alert.id}`}
      className="flex items-center gap-3 border border-line rounded-lg bg-surface-elevated px-4 py-3.5 no-underline transition-[border-color,box-shadow] hover:border-brand-primary hover:ring-3 hover:ring-brand-primary/10"
    >
      {/* Status dot */}
      <div className={cn('w-2 h-2 rounded-full shrink-0', alert.active ? 'bg-success' : 'bg-fg-placeholder')} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-fg leading-tight">
            {alert.name}
          </span>
          <AlertTypeBadge type={alert.type} size="sm" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {varInfo && (
            <span className="text-xs text-fg-tertiary">
              {varInfo.label}{varInfo.unit ? ` (${varInfo.unit})` : ''}
              {alert.condition.lessThan !== null && ` < ${alert.condition.lessThan}`}
              {alert.condition.lessThan !== null && alert.condition.greaterThan !== null && ' · '}
              {alert.condition.greaterThan !== null && ` > ${alert.condition.greaterThan}`}
            </span>
          )}
          {locationName && (
            <span className="text-xs text-fg-placeholder">{locationName}</span>
          )}
          {deviceSerial && (
            <span className="text-xs text-fg-placeholder">{deviceSerial}</span>
          )}
        </div>
      </div>

      {/* Channel icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {activeChannels.length === 0 ? (
          <span className="text-micro text-fg-placeholder">Sin canales</span>
        ) : (
          activeChannels.map((ch) => (
            <span key={ch as string} className="text-fg-tertiary">
              {ch === 'whatsapp' && <MessageCircle size={14} />}
              {ch === 'email' && <Mail size={14} />}
              {ch === 'sms' && <Phone size={14} />}
            </span>
          ))
        )}
      </div>

      <ChevronRight size={16} className="text-fg-placeholder shrink-0" />
    </Link>
  );
}

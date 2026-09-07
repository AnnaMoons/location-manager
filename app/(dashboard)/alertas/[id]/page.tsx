'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Save, Trash2, MessageCircle, Mail, Phone,
  Plus, Info, AlertTriangle, Leaf, Eye,
} from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { AlertTypeBadge } from '@/components/alerts/AlertTypeBadge';
import {
  ENVIRONMENTAL_VARIABLES, PIGVISION_VARIABLES,
  getVariableInfo, defaultChannels,
  type ConfiguredAlert, type AlertChannelConfig,
  type WhatsAppRecipient, type EmailRecipient, type SmsRecipient,
} from '@/lib/types/alert';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getAlert, updateAlert, deleteAlert, locations, devices } = useData();
  const { toast: showToast } = useToast();

  const original = getAlert(id);
  const [draft, setDraft] = useState<ConfiguredAlert | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (original) setDraft(JSON.parse(JSON.stringify(original)));
  }, [id]);

  if (!original || !draft) {
    return (
      <div className="py-12 px-6 text-center">
        <p className="text-base font-bold text-fg mb-2">
          Alerta no encontrada
        </p>
        <p className="text-sm text-fg-tertiary mb-6">
          La alerta que buscas no existe o fue eliminada.
        </p>
        <Link
          href="/alertas"
          className="text-brand-primary text-sm font-semibold no-underline"
        >
          ← Ver alertas
        </Link>
      </div>
    );
  }

  const locationName = locations.find((l) => l.id === draft.locationId)?.name ?? draft.locationId;
  const deviceSerial = draft.deviceId
    ? devices.find((d) => d.id === draft.deviceId)?.serialNumber
    : undefined;
  const varInfo = getVariableInfo(draft.condition.variable);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(original);
  const variables = draft.type === 'environmental' ? ENVIRONMENTAL_VARIABLES : PIGVISION_VARIABLES;

  function patch<K extends keyof ConfiguredAlert>(key: K, value: ConfiguredAlert[K]) {
    setDraft((d) => d ? { ...d, [key]: value } : d);
  }

  function patchCondition<K extends keyof ConfiguredAlert['condition']>(
    key: K,
    value: ConfiguredAlert['condition'][K]
  ) {
    setDraft((d) => d ? { ...d, condition: { ...d.condition, [key]: value } } : d);
  }

  function handleVariableChange(variable: string) {
    const info = getVariableInfo(variable);
    if (!info) return;
    setDraft((d) =>
      d ? {
        ...d,
        condition: {
          ...d.condition,
          variable,
          greaterThan: info.defaultMax,
          lessThan: info.defaultMin,
        },
      } : d
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!draft!.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!draft!.condition.variable) errs.variable = 'Selecciona una variable';
    if (draft!.condition.greaterThan === null && draft!.condition.lessThan === null) {
      errs.range = 'Define al menos un límite (mayor a o menor a)';
    }
    if (
      draft!.condition.greaterThan !== null &&
      draft!.condition.lessThan !== null &&
      draft!.condition.greaterThan! <= draft!.condition.lessThan!
    ) {
      errs.range = 'El límite superior debe ser mayor al límite inferior';
    }
    const hasChannel =
      draft!.channels.whatsapp.enabled ||
      draft!.channels.email.enabled ||
      draft!.channels.sms.enabled;
    if (!hasChannel) errs.channels = 'Activa al menos un canal de notificación';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateAlert(id, {
        name: draft!.name,
        active: draft!.active,
        condition: draft!.condition,
        channels: draft!.channels,
      });
      showToast({ title: 'Alerta guardada correctamente', variant: 'success' });
    } catch {
      showToast({ title: 'No pudimos guardar los cambios', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteAlert(id);
    showToast({ title: 'Alerta eliminada', variant: 'default' });
    router.push('/alertas');
  }

  return (
    <div className="max-w-180 mx-auto">
      {/* Back nav */}
      <div className="mb-5">
        <Link
          href="/alertas"
          className="inline-flex items-center gap-1 text-sm-tight text-brand-primary no-underline font-medium"
        >
          <ChevronLeft size={14} />
          Alertas
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <AlertTypeBadge type={draft.type} />
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.75 rounded-full text-micro font-semibold',
                draft.active ? 'bg-success-light text-success' : 'bg-surface-2 text-fg-placeholder'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', draft.active ? 'bg-success' : 'bg-fg-placeholder')} />
              {draft.active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <p className="text-micro text-fg-placeholder">
            {locationName}{deviceSerial ? ` › ${deviceSerial}` : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-line bg-surface-elevated text-error text-sm-tight font-semibold cursor-pointer"
          >
            <Trash2 size={13} />
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border-none text-white text-sm-tight font-semibold',
              isDirty && !saving ? 'bg-brand-primary cursor-pointer' : 'bg-fg-disabled cursor-not-allowed'
            )}
          >
            <Save size={13} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Name + toggle */}
      <Section>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <FieldLabel>Nombre de la alerta</FieldLabel>
            <input
              value={draft.name}
              onChange={(e) => patch('name', e.target.value)}
              placeholder="Ej: Temperatura crítica Galpón Norte"
              className={cn(
                'w-full h-9 px-3 rounded text-sm outline-none box-border border',
                errors.name ? 'border-error' : 'border-line'
              )}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </div>
          <div className="pt-5">
            <Toggle
              checked={draft.active}
              onChange={(v) => patch('active', v)}
              label={draft.active ? 'Activa' : 'Inactiva'}
            />
          </div>
        </div>
      </Section>

      {/* Variable & condition */}
      <Section title="Variable y condición de activación">
        {/* Variable selector */}
        <div className="mb-3">
          <FieldLabel>Variable a monitorear</FieldLabel>
          <select
            value={draft.condition.variable}
            onChange={(e) => handleVariableChange(e.target.value)}
            className={cn(
              'w-full h-9 px-3 rounded text-sm bg-surface-elevated cursor-pointer border',
              errors.variable ? 'border-error' : 'border-line'
            )}
          >
            {variables.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}{v.unit ? ` (${v.unit})` : ''}
              </option>
            ))}
          </select>
          {errors.variable && <FieldError>{errors.variable}</FieldError>}
        </div>

        {/* Reference ranges */}
        {varInfo && (
          <InfoBlock>
            <Info size={13} />
            <span>
              Rango de referencia:{' '}
              <strong>{varInfo.defaultMin} – {varInfo.defaultMax}{varInfo.unit ? ` ${varInfo.unit}` : ''}</strong>.
              {' '}Puedes editarlo según las necesidades de tu granja.
            </span>
          </InfoBlock>
        )}

        {/* Thresholds */}
        <div className="flex gap-3 mt-3">
          <div className="flex-1">
            <FieldLabel>Alerta si baja de</FieldLabel>
            <div className="relative">
              <span className={prefixClass}>{varInfo?.unit || '—'}</span>
              <input
                type="number"
                value={draft.condition.lessThan ?? ''}
                onChange={(e) =>
                  patchCondition('lessThan', e.target.value === '' ? null : Number(e.target.value))
                }
                placeholder="Sin límite"
                className={cn(inputClass, 'pl-11')}
              />
            </div>
          </div>
          <div className="flex-1">
            <FieldLabel>Alerta si sube de</FieldLabel>
            <div className="relative">
              <span className={prefixClass}>{varInfo?.unit || '—'}</span>
              <input
                type="number"
                value={draft.condition.greaterThan ?? ''}
                onChange={(e) =>
                  patchCondition('greaterThan', e.target.value === '' ? null : Number(e.target.value))
                }
                placeholder="Sin límite"
                className={cn(inputClass, 'pl-11')}
              />
            </div>
          </div>
        </div>

        {errors.range && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-error">
            <AlertTriangle size={12} />
            {errors.range}
          </div>
        )}

        {/* Duration + sensor filter */}
        <div className="flex gap-3 mt-3">
          <div className="flex-1">
            <FieldLabel>Tiempo mínimo fuera de rango</FieldLabel>
            <div className="relative">
              <span className={prefixClass}>min</span>
              <input
                type="number"
                min={1}
                value={draft.condition.durationMinutes}
                onChange={(e) => patchCondition('durationMinutes', Math.max(1, Number(e.target.value)))}
                className={cn(inputClass, 'pl-11')}
              />
            </div>
          </div>
          {draft.type === 'environmental' && (
            <div className="flex-1">
              <FieldLabel>Sensor a evaluar</FieldLabel>
              <select
                value={draft.condition.sensorFilter}
                onChange={(e) => patchCondition('sensorFilter', e.target.value as 'all' | 'average')}
                className={inputClass}
              >
                <option value="all">Todos los sensores</option>
                <option value="average">Promedio</option>
              </select>
            </div>
          )}
        </div>

        {/* Auto-age */}
        {draft.type === 'environmental' && (
          <div className="flex items-center justify-between mt-3.5 px-3.5 py-3 bg-surface-2 rounded-lg">
            <div>
              <p className="text-sm-tight font-semibold text-fg mb-0.5">
                Ajuste automático por edad
              </p>
              <p className="text-xs text-fg-tertiary">
                Los rangos se actualizan según la edad de los animales
              </p>
            </div>
            <Toggle
              checked={draft.condition.autoAgeUpdate}
              onChange={(v) => patchCondition('autoAgeUpdate', v)}
            />
          </div>
        )}
      </Section>

      {/* Channels */}
      <Section title="Canales de notificación">
        {errors.channels && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-error">
            <AlertTriangle size={12} />
            {errors.channels}
          </div>
        )}
        <ChannelConfigEditor
          channels={draft.channels}
          onChange={(channels) => setDraft((d) => d ? { ...d, channels } : d)}
        />
      </Section>

      {/* Privacy notice */}
      <InfoBlock variant="caution" className="mb-8">
        <Info size={13} />
        <span>
          Al agregar números y correos, asegúrate de contar con el consentimiento de los destinatarios para el tratamiento de sus datos personales, de acuerdo con la política de privacidad de Asimetrix.
        </span>
      </InfoBlock>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-overlay-bg"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-surface-elevated rounded-lg p-6 max-w-100 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-fg mb-2">
              Eliminar alerta
            </h2>
            <p className="text-sm text-fg-tertiary mb-5 leading-relaxed">
              ¿Estás seguro de que quieres eliminar "{draft.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-line rounded-md bg-surface-elevated text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border-none rounded-md bg-error text-white text-sm font-semibold cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-lg p-4 mb-4 bg-surface-elevated">
      {title && (
        <p className="text-micro font-bold text-fg-tertiary uppercase tracking-wide mb-3.5">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-fg-secondary mb-1">
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-error mt-1 flex items-center gap-1">
      <AlertTriangle size={11} />
      {children}
    </p>
  );
}

function InfoBlock({
  children,
  variant = 'info',
  className,
}: {
  children: React.ReactNode;
  variant?: 'info' | 'caution';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-2 px-3 py-2.5 rounded-md text-xs leading-relaxed mb-3',
        variant === 'caution' ? 'bg-warning-light text-warning-dark' : 'bg-surface-blue text-brand-primary',
        className
      )}
    >
      {children}
    </div>
  );
}

const inputClass =
  'w-full h-9 px-3 border border-line rounded text-sm bg-surface-elevated outline-none box-border';

const prefixClass =
  'absolute left-0 top-0 bottom-0 flex items-center justify-center px-2.5 bg-surface-2 border-r border-line rounded-l text-xs text-fg-tertiary font-semibold min-w-9';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm-tight text-fg-secondary">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'w-10 h-5.5 rounded-full border-none cursor-pointer relative transition-[background] duration-150 shrink-0',
          checked ? 'bg-brand-primary' : 'bg-line'
        )}
      >
        <span
          className={cn(
            'absolute top-0.75 w-4 h-4 rounded-full bg-white transition-[left] duration-150',
            checked ? 'left-5.25' : 'left-0.75'
          )}
        />
      </button>
    </div>
  );
}

function genId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ChannelConfigEditor({
  channels,
  onChange,
}: {
  channels: AlertChannelConfig;
  onChange: (c: AlertChannelConfig) => void;
}) {
  function updateWhatsApp(partial: Partial<typeof channels.whatsapp>) {
    onChange({ ...channels, whatsapp: { ...channels.whatsapp, ...partial } });
  }
  function updateEmail(partial: Partial<typeof channels.email>) {
    onChange({ ...channels, email: { ...channels.email, ...partial } });
  }
  function updateSms(partial: Partial<typeof channels.sms>) {
    onChange({ ...channels, sms: { ...channels.sms, ...partial } });
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* WhatsApp — icono con la marca oficial de WhatsApp, no un token del sistema */}
      <ChannelCard
        icon={<MessageCircle size={16} className="text-success" />}
        label="WhatsApp"
        enabled={channels.whatsapp.enabled}
        onToggle={(v) => updateWhatsApp({ enabled: v })}
      >
        {channels.whatsapp.enabled && (
          <>
            <InfoBlock variant="caution">
              <Info size={13} />
              Al agregar un número, el destinatario acepta recibir alertas por WhatsApp.
            </InfoBlock>
            {channels.whatsapp.recipients.map((r) => (
              <RecipientRow key={r.id} onRemove={() => updateWhatsApp({ recipients: channels.whatsapp.recipients.filter((x) => x.id !== r.id) })}>
                <CountryCodeSelect
                  value={r.countryCode}
                  onChange={(v) => updateWhatsApp({ recipients: channels.whatsapp.recipients.map((x) => x.id === r.id ? { ...x, countryCode: v } : x) })}
                />
                <input
                  type="tel"
                  placeholder="3001234567"
                  value={r.phone}
                  onChange={(e) => updateWhatsApp({ recipients: channels.whatsapp.recipients.map((x) => x.id === r.id ? { ...x, phone: e.target.value } : x) })}
                  className={cn(inputClass, 'flex-1')}
                />
              </RecipientRow>
            ))}
            <AddButton onClick={() => updateWhatsApp({ recipients: [...channels.whatsapp.recipients, { id: genId(), countryCode: '+57', phone: '' }] })}>
              Agregar número
            </AddButton>
          </>
        )}
      </ChannelCard>

      {/* Email */}
      <ChannelCard
        icon={<Mail size={16} className="text-brand-primary" />}
        label="Correo electrónico"
        enabled={channels.email.enabled}
        onToggle={(v) => updateEmail({ enabled: v })}
      >
        {channels.email.enabled && (
          <>
            {channels.email.recipients.map((r) => (
              <RecipientRow key={r.id} onRemove={() => updateEmail({ recipients: channels.email.recipients.filter((x) => x.id !== r.id) })}>
                <input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={r.email}
                  onChange={(e) => updateEmail({ recipients: channels.email.recipients.map((x) => x.id === r.id ? { ...x, email: e.target.value } : x) })}
                  className={cn(inputClass, 'flex-1')}
                />
              </RecipientRow>
            ))}
            <AddButton onClick={() => updateEmail({ recipients: [...channels.email.recipients, { id: genId(), email: '' }] })}>
              Agregar correo
            </AddButton>
          </>
        )}
      </ChannelCard>

      {/* SMS */}
      <ChannelCard
        icon={<Phone size={16} className="text-fg-tertiary" />}
        label="SMS"
        enabled={channels.sms.enabled}
        onToggle={(v) => updateSms({ enabled: v })}
      >
        {channels.sms.enabled && (
          <>
            {channels.sms.recipients.map((r) => (
              <RecipientRow key={r.id} onRemove={() => updateSms({ recipients: channels.sms.recipients.filter((x) => x.id !== r.id) })}>
                <CountryCodeSelect
                  value={r.countryCode}
                  onChange={(v) => updateSms({ recipients: channels.sms.recipients.map((x) => x.id === r.id ? { ...x, countryCode: v } : x) })}
                />
                <input
                  type="tel"
                  placeholder="3001234567"
                  value={r.phone}
                  onChange={(e) => updateSms({ recipients: channels.sms.recipients.map((x) => x.id === r.id ? { ...x, phone: e.target.value } : x) })}
                  className={cn(inputClass, 'flex-1')}
                />
              </RecipientRow>
            ))}
            <AddButton onClick={() => updateSms({ recipients: [...channels.sms.recipients, { id: genId(), countryCode: '+57', phone: '' }] })}>
              Agregar número
            </AddButton>
          </>
        )}
      </ChannelCard>
    </div>
  );
}

function ChannelCard({
  icon,
  label,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg overflow-hidden transition-[border-color] border', enabled ? 'border-brand-primary' : 'border-line')}>
      <div className={cn('flex items-center gap-2.5 px-3.5 py-3', enabled ? 'bg-surface-blue/40' : 'bg-surface-elevated')}>
        {icon}
        <span className="flex-1 text-sm font-semibold text-fg">{label}</span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {children && (
        <div className="px-3.5 py-3 border-t border-line flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

function RecipientRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex gap-2 items-center">
      {children}
      <button
        onClick={onRemove}
        className="border-none bg-transparent text-error cursor-pointer p-1 shrink-0 flex items-center"
        aria-label="Eliminar destinatario"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function CountryCodeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-2 border border-line rounded text-sm-tight bg-surface-2 cursor-pointer shrink-0"
    >
      <option value="+57">🇨🇴 +57</option>
      <option value="+1">🇺🇸 +1</option>
      <option value="+52">🇲🇽 +52</option>
      <option value="+56">🇨🇱 +56</option>
      <option value="+54">🇦🇷 +54</option>
      <option value="+55">🇧🇷 +55</option>
    </select>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.25 border border-line rounded-md bg-surface-elevated text-xs font-semibold text-brand-primary cursor-pointer self-start"
    >
      <Plus size={12} />
      {children}
    </button>
  );
}

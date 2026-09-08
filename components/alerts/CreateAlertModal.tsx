'use client';

import { useState } from 'react';
import { X, ChevronRight, ArrowLeft, Leaf, Eye, Info, AlertTriangle, Plus, Trash2, MessageCircle, Mail, Phone } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  ENVIRONMENTAL_VARIABLES, PIGVISION_VARIABLES, getVariableInfo, defaultChannels,
  type AlertType, type ConfiguredAlert, type AlertChannelConfig,
} from '@/lib/types/alert';

type WizardStep = 'type' | 'location' | 'variable' | 'condition' | 'channels';

const ENV_STEPS: WizardStep[] = ['type', 'location', 'variable', 'condition', 'channels'];
const PV_STEPS:  WizardStep[] = ['type', 'location', 'variable', 'condition', 'channels'];

const STEP_LABELS: Record<WizardStep, string> = {
  type:      'Tipo',
  location:  'Ubicación',
  variable:  'Variable',
  condition: 'Condición',
  channels:  'Canales',
};

interface CreateAlertModalProps {
  prefilterLocationId?: string;
  prefilterDeviceId?: string;
  onClose: () => void;
}

const selectClass =
  'w-full h-9 px-3 border border-line rounded text-sm bg-surface-elevated cursor-pointer box-border';

export function CreateAlertModal({ prefilterLocationId, prefilterDeviceId, onClose }: CreateAlertModalProps) {
  const { locations, devices, createAlert } = useData();
  const { toast: showToast } = useToast();

  const [type, setType] = useState<AlertType | null>(null);
  const [locationId, setLocationId] = useState<string>(prefilterLocationId ?? '');
  const [deviceId, setDeviceId] = useState<string>(prefilterDeviceId ?? '');
  const [variable, setVariable] = useState<string>('');
  const [greaterThan, setGreaterThan] = useState<number | null>(null);
  const [lessThan, setLessThan] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [autoAgeUpdate, setAutoAgeUpdate] = useState(false);
  const [sensorFilter, setSensorFilter] = useState<'all' | 'average'>('all');
  const [name, setName] = useState('');
  const [channels, setChannels] = useState<AlertChannelConfig>(defaultChannels());
  const [step, setStep] = useState<WizardStep>('type');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const stepOrder = type === 'environmental' ? ENV_STEPS : PV_STEPS;

  // Derived location lists
  const barnLocations = locations.filter((l) => l.type === 'barn');
  const penLocations = locations.filter((l) => l.type === 'pen');
  const pigvisionDevices = devices.filter((d) => d.type === 'pigvision' && d.state === 'production');

  const varInfo = variable ? getVariableInfo(variable) : null;
  const variableList = type === 'environmental' ? ENVIRONMENTAL_VARIABLES : PIGVISION_VARIABLES;

  function goNext() {
    setErrors({});
    if (step === 'type') {
      if (!type) { setErrors({ type: 'Selecciona un tipo de alerta para continuar' }); return; }
      if (!variable) {
        const first = variableList[0];
        setVariable(first.key);
        setGreaterThan(first.defaultMax);
        setLessThan(first.defaultMin);
      }
      setStep('location');
    } else if (step === 'location') {
      if (!locationId) { setErrors({ location: 'Selecciona una ubicación' }); return; }
      if (type === 'pigvision' && !deviceId) { setErrors({ device: 'Selecciona un dispositivo Pig Vision' }); return; }
      setStep('variable');
    } else if (step === 'variable') {
      if (!variable) { setErrors({ variable: 'Selecciona una variable' }); return; }
      setStep('condition');
    } else if (step === 'condition') {
      const errs: Record<string, string> = {};
      if (!name.trim()) errs.name = 'El nombre es obligatorio';
      if (greaterThan === null && lessThan === null) errs.range = 'Define al menos un límite';
      if (greaterThan !== null && lessThan !== null && greaterThan <= lessThan)
        errs.range = 'El límite superior debe ser mayor al inferior';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setStep('channels');
    }
  }

  function goBack() {
    setErrors({});
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  }

  function handleTypeChange(t: AlertType) {
    setType(t);
    setLocationId(prefilterLocationId ?? '');
    setDeviceId(prefilterDeviceId ?? '');
    setVariable('');
    setGreaterThan(null);
    setLessThan(null);
  }

  function handleVariableChange(v: string) {
    const info = getVariableInfo(v)!;
    setVariable(v);
    setGreaterThan(info.defaultMax);
    setLessThan(info.defaultMin);
  }

  async function handleCreate() {
    if (!type || !locationId || !variable) return;
    setSubmitting(true);
    try {
      await createAlert({
        name: name.trim(),
        active: true,
        type,
        locationId,
        deviceId: type === 'pigvision' && deviceId ? deviceId : undefined,
        condition: { variable, greaterThan, lessThan, durationMinutes, autoAgeUpdate, sensorFilter },
        channels,
      });
      showToast({ title: 'Alerta creada correctamente', variant: 'success' });
      onClose();
    } catch {
      showToast({ title: 'No pudimos crear la alerta', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const currentIdx = stepOrder.indexOf(step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-overlay-bg"
      onClick={onClose}
    >
      <div
        className="w-full flex flex-col bg-surface-elevated rounded-lg max-w-125 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <span className="text-sm-tight font-semibold text-fg-secondary">Nueva alerta</span>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-fg-tertiary flex items-center">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-3.5">
          <div className="flex items-start">
            {stepOrder.map((s, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={s} className={cn('flex flex-col items-center', idx < stepOrder.length - 1 && 'flex-1')}>
                  <div className="flex items-center w-full">
                    <div
                      className={cn(
                        'w-5.5 h-5.5 rounded-full text-2xs font-bold flex items-center justify-center shrink-0',
                        done ? 'bg-success text-white' : active ? 'bg-brand-primary text-white' : 'bg-surface-2 text-fg-disabled'
                      )}
                    >
                      {done ? '✓' : idx + 1}
                    </div>
                    {idx < stepOrder.length - 1 && (
                      <div className={cn('flex-1 h-0.5 ml-0.5', done ? 'bg-success' : 'bg-line')} />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-3xs mt-1 whitespace-nowrap',
                      active ? 'font-bold text-fg' : done ? 'font-normal text-success' : 'font-normal text-fg-disabled'
                    )}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Step 1: Type */}
          {step === 'type' && (
            <div>
              <StepHeading question="¿Qué tipo de alerta quieres crear?" why="El tipo determina qué variables puedes monitorear y qué ubicaciones están disponibles." />
              <div className="flex flex-col gap-2.5">
                <TypeCard type="environmental" selected={type === 'environmental'} onClick={() => handleTypeChange('environmental')} />
                <TypeCard type="pigvision" selected={type === 'pigvision'} onClick={() => handleTypeChange('pigvision')} />
                {errors.type && <ErrorMsg>{errors.type}</ErrorMsg>}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && type && (
            <div>
              <StepHeading
                question={type === 'environmental' ? '¿En qué galpón están los sensores?' : '¿En qué corral está la cámara?'}
                why={type === 'environmental'
                  ? 'La alerta se activará cuando cualquier sensor de ese galpón supere los límites definidos.'
                  : 'Las cámaras Pig Vision monitorean animales por corral.'}
              />
              <div className="mb-3.5">
                <FieldLabel>{type === 'environmental' ? 'Galpón' : 'Corral'}</FieldLabel>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Selecciona…</option>
                  {(type === 'environmental' ? barnLocations : penLocations).map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {errors.location && <ErrorMsg>{errors.location}</ErrorMsg>}
              </div>

              {type === 'pigvision' && (
                <div>
                  <FieldLabel>Dispositivo Pig Vision</FieldLabel>
                  <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className={selectClass}>
                    <option value="">Selecciona…</option>
                    {pigvisionDevices.map((d) => (
                      <option key={d.id} value={d.id}>{d.serialNumber}</option>
                    ))}
                  </select>
                  {errors.device && <ErrorMsg>{errors.device}</ErrorMsg>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Variable */}
          {step === 'variable' && type && (
            <div>
              <StepHeading question="¿Qué variable quieres monitorear?" why="Cada alerta cubre una variable. Puedes crear alertas adicionales para otras variables." />
              <FieldLabel>{type === 'environmental' ? 'Variable ambiental' : 'Variable Pig Vision'}</FieldLabel>
              <select value={variable} onChange={(e) => handleVariableChange(e.target.value)} className={selectClass}>
                {variableList.map((v) => (
                  <option key={v.key} value={v.key}>{v.label}{v.unit ? ` (${v.unit})` : ''}</option>
                ))}
              </select>
              {varInfo && (
                <InfoBlock className="mt-3">
                  <Info size={13} />
                  Rango de referencia: <strong>{varInfo.defaultMin} – {varInfo.defaultMax}{varInfo.unit ? ` ${varInfo.unit}` : ''}</strong>. Úsalo como punto de partida.
                </InfoBlock>
              )}
            </div>
          )}

          {/* Step 4: Condition */}
          {step === 'condition' && varInfo && (
            <div className="flex flex-col gap-3.5">
              <StepHeading question="¿Cuándo debe activarse la alerta?" why="Define los límites y el tiempo mínimo fuera de rango antes de que se envíe la notificación." />
              <div>
                <FieldLabel>Nombre de la alerta</FieldLabel>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Ej: ${varInfo.label} crítico`}
                  autoFocus
                  className={cn(selectClass, 'h-9')}
                />
                {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
              </div>

              <InfoBlock>
                <Info size={13} />
                Rango de referencia: <strong>{varInfo.defaultMin} – {varInfo.defaultMax}{varInfo.unit ? ` ${varInfo.unit}` : ''}</strong>
              </InfoBlock>

              <div className="flex gap-2.5">
                <div className="flex-1">
                  <FieldLabel>Alerta si baja de</FieldLabel>
                  <div className="relative">
                    <span className={prefixClass}>{varInfo.unit || '—'}</span>
                    <input type="number" value={lessThan ?? ''} onChange={(e) => setLessThan(e.target.value === '' ? null : Number(e.target.value))} placeholder="Sin límite" className={cn(selectClass, 'h-9 pl-11')} />
                  </div>
                </div>
                <div className="flex-1">
                  <FieldLabel>Alerta si sube de</FieldLabel>
                  <div className="relative">
                    <span className={prefixClass}>{varInfo.unit || '—'}</span>
                    <input type="number" value={greaterThan ?? ''} onChange={(e) => setGreaterThan(e.target.value === '' ? null : Number(e.target.value))} placeholder="Sin límite" className={cn(selectClass, 'h-9 pl-11')} />
                  </div>
                </div>
              </div>
              {errors.range && <ErrorMsg>{errors.range}</ErrorMsg>}

              <div className="flex gap-2.5">
                <div className="flex-1">
                  <FieldLabel>Tiempo mínimo fuera de rango</FieldLabel>
                  <div className="relative">
                    <span className={prefixClass}>min</span>
                    <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))} className={cn(selectClass, 'h-9 pl-11')} />
                  </div>
                </div>
                {type === 'environmental' && (
                  <div className="flex-1">
                    <FieldLabel>Sensor a evaluar</FieldLabel>
                    <select value={sensorFilter} onChange={(e) => setSensorFilter(e.target.value as 'all' | 'average')} className={selectClass}>
                      <option value="all">Todos los sensores</option>
                      <option value="average">Promedio</option>
                    </select>
                  </div>
                )}
              </div>

              {type === 'environmental' && (
                <div className="flex items-center justify-between px-3.5 py-3 bg-surface-2 rounded-lg">
                  <div>
                    <p className="text-sm-tight font-semibold text-fg mb-0.5">Ajuste automático por edad</p>
                    <p className="text-xs text-fg-tertiary">Los rangos cambian según la edad de los animales</p>
                  </div>
                  <Toggle checked={autoAgeUpdate} onChange={setAutoAgeUpdate} />
                </div>
              )}
            </div>
          )}

          {/* Step 5: Channels */}
          {step === 'channels' && varInfo && (
            <div className="flex flex-col gap-3.5">
              <StepHeading question="¿A quién le llega la notificación?" why="Activa los canales que quieras usar y agrega los destinatarios. Puedes cambiarlos en cualquier momento." />

              {/* Summary */}
              <div className="bg-surface-2 border border-line rounded-lg px-3.5 py-2.5 text-xs text-fg-secondary leading-relaxed">
                <strong className="text-fg">{name}</strong>
                {' '}— se activará si {varInfo.label.toLowerCase()}{' '}
                {lessThan !== null && <>baja de <strong>{lessThan} {varInfo.unit}</strong></>}
                {lessThan !== null && greaterThan !== null && ' o '}
                {greaterThan !== null && <>sube de <strong>{greaterThan} {varInfo.unit}</strong></>}
                {' '}por más de <strong>{durationMinutes} min</strong>.
              </div>

              <MiniChannelConfig channels={channels} onChange={setChannels} />

              <p className="text-micro text-fg-placeholder leading-relaxed">
                Al agregar números o correos, asegúrate de que los destinatarios han aceptado recibir notificaciones.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
          <div>
            {step !== 'type' && (
              <button onClick={goBack} className="inline-flex items-center gap-1.5 border-none bg-transparent text-sm text-brand-primary cursor-pointer font-medium">
                <ArrowLeft size={14} />
                Atrás
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.75 border border-line rounded-md bg-surface-elevated text-sm cursor-pointer">
              Cancelar
            </button>
            {step !== 'channels' ? (
              <button onClick={goNext} className="inline-flex items-center gap-1.5 px-4 py-1.75 border-none rounded-md bg-brand-primary text-white text-sm font-semibold cursor-pointer">
                Siguiente
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={submitting}
                className={cn(
                  'px-4 py-1.75 border-none rounded-md text-white text-sm font-semibold',
                  submitting ? 'bg-fg-disabled cursor-not-allowed' : 'bg-brand-primary cursor-pointer'
                )}
              >
                {submitting ? 'Creando...' : 'Crear alerta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable pieces ──────────────────────────────────────── */

function StepHeading({ question, why }: { question: string; why: string }) {
  return (
    <div className="mb-4.5">
      <h2 className="text-body-sm font-bold text-fg mb-1 leading-tight">{question}</h2>
      <p className="text-xs text-fg-tertiary leading-relaxed">{why}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-fg-secondary mb-1">{children}</label>;
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-error mt-1 flex items-center gap-1">
      <AlertTriangle size={11} />{children}
    </p>
  );
}

function InfoBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-2 px-3 py-2 rounded-md bg-surface-blue text-brand-primary text-xs leading-relaxed', className)}>
      {children}
    </div>
  );
}

const prefixClass =
  'absolute left-0 top-0 bottom-0 flex items-center justify-center px-2.5 bg-surface-2 border-r border-line rounded-l text-xs text-fg-tertiary font-semibold min-w-9';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-9.5 h-5 rounded-full border-none cursor-pointer relative transition-[background] duration-150 shrink-0',
        checked ? 'bg-brand-primary' : 'bg-line'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[left] duration-150',
          checked ? 'left-5' : 'left-0.5'
        )}
      />
    </button>
  );
}

function TypeCard({ type, selected, onClick }: { type: AlertType; selected: boolean; onClick: () => void }) {
  const isEnv = type === 'environmental';
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3.5 p-3.5 rounded-lg text-left w-full transition-all',
        'border-2',
        selected ? (isEnv ? 'border-success bg-success-light' : 'border-brand-primary bg-surface-blue') : 'border-line bg-surface-elevated'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          selected ? (isEnv ? 'bg-success text-white' : 'bg-brand-primary text-white') : 'bg-surface-2 text-fg-placeholder'
        )}
      >
        {isEnv ? <Leaf size={20} /> : <Eye size={20} />}
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-bold mb-1', selected ? (isEnv ? 'text-success' : 'text-brand-primary') : 'text-fg')}>
          {isEnv ? 'Medioambiental' : 'Pig Vision'}
        </p>
        <p className="text-xs text-fg-secondary mb-0.5 leading-snug">
          {isEnv
            ? 'Temperatura, CO₂, humedad, gases, presión, calidad del agua.'
            : 'Peso, brillo, ángulo, señal WiFi, batería y otras variables de cámaras.'}
        </p>
        <p className="text-micro text-fg-placeholder">
          {isEnv ? 'Para granjas con nodos ambientales instalados' : 'Para granjas con cámaras Pig Vision activas'}
        </p>
      </div>
      {selected && (
        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-micro font-bold shrink-0', isEnv ? 'bg-success' : 'bg-brand-primary')}>✓</div>
      )}
    </button>
  );
}

function genId() { return `r-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function MiniChannelConfig({ channels, onChange }: { channels: AlertChannelConfig; onChange: (c: AlertChannelConfig) => void }) {
  function updateCh(key: keyof AlertChannelConfig, partial: Partial<AlertChannelConfig[typeof key]>) {
    onChange({ ...channels, [key]: { ...channels[key], ...partial } });
  }

  const recipientInputClass = 'flex-1 h-8 px-2.5 border border-line rounded text-sm-tight';
  const countryCodeClass = 'h-8 px-1.5 border border-line rounded text-xs bg-surface-2 shrink-0';
  const removeBtnClass = 'border-none bg-transparent cursor-pointer text-error p-0.5';
  const addBtnClass = 'inline-flex items-center gap-1.5 border border-line rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-brand-primary cursor-pointer font-semibold self-start';

  return (
    <div className="flex flex-col gap-2">
      {/* WhatsApp — icono con la marca oficial de WhatsApp, no un token del sistema */}
      <MiniChannel icon={<MessageCircle size={15} className="text-success" />} label="WhatsApp" enabled={channels.whatsapp.enabled} onToggle={(v) => updateCh('whatsapp', { enabled: v })}>
        {channels.whatsapp.enabled && (
          <>
            {channels.whatsapp.recipients.map((r) => (
              <div key={r.id} className="flex gap-1.5 items-center">
                <select value={r.countryCode} onChange={(e) => updateCh('whatsapp', { recipients: channels.whatsapp.recipients.map((x) => x.id === r.id ? { ...x, countryCode: e.target.value } : x) })} className={countryCodeClass}>
                  <option value="+57">🇨🇴 +57</option><option value="+1">🇺🇸 +1</option><option value="+52">🇲🇽 +52</option>
                </select>
                <input type="tel" placeholder="3001234567" value={r.phone} onChange={(e) => updateCh('whatsapp', { recipients: channels.whatsapp.recipients.map((x) => x.id === r.id ? { ...x, phone: e.target.value } : x) })} className={recipientInputClass} />
                <button onClick={() => updateCh('whatsapp', { recipients: channels.whatsapp.recipients.filter((x) => x.id !== r.id) })} className={removeBtnClass}><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => updateCh('whatsapp', { recipients: [...channels.whatsapp.recipients, { id: genId(), countryCode: '+57', phone: '' }] })} className={addBtnClass}>
              <Plus size={11} />Agregar número
            </button>
          </>
        )}
      </MiniChannel>

      {/* Email */}
      <MiniChannel icon={<Mail size={15} className="text-brand-primary" />} label="Correo electrónico" enabled={channels.email.enabled} onToggle={(v) => updateCh('email', { enabled: v })}>
        {channels.email.enabled && (
          <>
            {channels.email.recipients.map((r) => (
              <div key={r.id} className="flex gap-1.5 items-center">
                <input type="email" placeholder="correo@empresa.com" value={r.email} onChange={(e) => updateCh('email', { recipients: channels.email.recipients.map((x) => x.id === r.id ? { ...x, email: e.target.value } : x) })} className={recipientInputClass} />
                <button onClick={() => updateCh('email', { recipients: channels.email.recipients.filter((x) => x.id !== r.id) })} className={removeBtnClass}><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => updateCh('email', { recipients: [...channels.email.recipients, { id: genId(), email: '' }] })} className={addBtnClass}>
              <Plus size={11} />Agregar correo
            </button>
          </>
        )}
      </MiniChannel>

      {/* SMS */}
      <MiniChannel icon={<Phone size={15} className="text-fg-tertiary" />} label="SMS" enabled={channels.sms.enabled} onToggle={(v) => updateCh('sms', { enabled: v })}>
        {channels.sms.enabled && (
          <>
            {channels.sms.recipients.map((r) => (
              <div key={r.id} className="flex gap-1.5 items-center">
                <select value={r.countryCode} onChange={(e) => updateCh('sms', { recipients: channels.sms.recipients.map((x) => x.id === r.id ? { ...x, countryCode: e.target.value } : x) })} className={countryCodeClass}>
                  <option value="+57">🇨🇴 +57</option><option value="+1">🇺🇸 +1</option><option value="+52">🇲🇽 +52</option>
                </select>
                <input type="tel" placeholder="3001234567" value={r.phone} onChange={(e) => updateCh('sms', { recipients: channels.sms.recipients.map((x) => x.id === r.id ? { ...x, phone: e.target.value } : x) })} className={recipientInputClass} />
                <button onClick={() => updateCh('sms', { recipients: channels.sms.recipients.filter((x) => x.id !== r.id) })} className={removeBtnClass}><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => updateCh('sms', { recipients: [...channels.sms.recipients, { id: genId(), countryCode: '+57', phone: '' }] })} className={addBtnClass}>
              <Plus size={11} />Agregar número
            </button>
          </>
        )}
      </MiniChannel>
    </div>
  );
}

function MiniChannel({
  icon, label, enabled, onToggle, children,
}: {
  icon: React.ReactNode; label: string; enabled: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg overflow-hidden transition-[border-color] border', enabled ? 'border-brand-primary' : 'border-line')}>
      <div className={cn('flex items-center gap-2.5 px-3 py-2.5', enabled ? 'bg-surface-blue/40' : 'bg-surface-elevated')}>
        {icon}
        <span className="flex-1 text-sm-tight font-semibold text-fg">{label}</span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {children && (
        <div className="px-3 py-2.5 border-t border-line flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

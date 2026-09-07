export type AlertType = 'environmental' | 'pigvision';

export type NotificationChannel = 'whatsapp' | 'email' | 'sms';

export interface WhatsAppRecipient {
  id: string;
  countryCode: string;
  phone: string;
}

export interface EmailRecipient {
  id: string;
  email: string;
}

export interface SmsRecipient {
  id: string;
  countryCode: string;
  phone: string;
}

export interface AlertCondition {
  variable: string;
  greaterThan: number | null;
  lessThan: number | null;
  durationMinutes: number;
  autoAgeUpdate: boolean;
  sensorFilter: 'all' | 'average';
}

export interface AlertChannelConfig {
  whatsapp: {
    enabled: boolean;
    recipients: WhatsAppRecipient[];
  };
  email: {
    enabled: boolean;
    recipients: EmailRecipient[];
  };
  sms: {
    enabled: boolean;
    recipients: SmsRecipient[];
  };
}

export interface ConfiguredAlert {
  id: string;
  name: string;
  active: boolean;
  type: AlertType;
  locationId: string;
  deviceId?: string;
  condition: AlertCondition;
  channels: AlertChannelConfig;
  createdAt: string;
  updatedAt: string;
}

export interface EventDataPoint {
  date: string;
  events: number;
}

export const ENVIRONMENTAL_VARIABLES = [
  { key: 'temperature',    label: 'Temperatura',         unit: '°C',  defaultMin: 18,  defaultMax: 30  },
  { key: 'humidity',       label: 'Humedad',              unit: '%',   defaultMin: 50,  defaultMax: 70  },
  { key: 'co2',            label: 'CO₂',                  unit: 'ppm', defaultMin: 0,   defaultMax: 2500},
  { key: 'nh3',            label: 'NH₃',                  unit: 'ppm', defaultMin: 0,   defaultMax: 10  },
  { key: 'co',             label: 'CO',                   unit: 'ppm', defaultMin: 0,   defaultMax: 50  },
  { key: 'h2s',            label: 'H₂S',                  unit: 'ppm', defaultMin: 0,   defaultMax: 5   },
  { key: 'airspeed',       label: 'Velocidad de aire',    unit: 'm/s', defaultMin: 0.2, defaultMax: 2.0 },
  { key: 'staticpressure', label: 'Presión estática',     unit: 'Pa',  defaultMin: 20,  defaultMax: 35  },
  { key: 'watertemp',      label: 'Temperatura del agua', unit: '°C',  defaultMin: 18,  defaultMax: 24  },
  { key: 'waterorp',       label: 'ORP del agua',         unit: 'mV',  defaultMin: 650, defaultMax: 720 },
  { key: 'waterph',        label: 'pH del agua',          unit: '',    defaultMin: 5.4, defaultMax: 6.0 },
] as const;

export const PIGVISION_VARIABLES = [
  { key: 'weight',       label: 'Peso',                  unit: 'kg',  defaultMin: 5,   defaultMax: 120  },
  { key: 'grossweight',  label: 'Peso bruto',            unit: 'kg',  defaultMin: 5,   defaultMax: 130  },
  { key: 'angle',        label: 'Ángulo de inclinación', unit: '°',   defaultMin: 0,   defaultMax: 15   },
  { key: 'brightness',   label: 'Brillo de imagen',      unit: '%',   defaultMin: 20,  defaultMax: 80   },
  { key: 'blurry',       label: 'Imagen borrosa',        unit: '%',   defaultMin: 0,   defaultMax: 10   },
  { key: 'wifisignal',   label: 'Señal de WiFi',         unit: 'dBm', defaultMin: -75, defaultMax: -30  },
  { key: 'battery',      label: 'Batería',               unit: '%',   defaultMin: 20,  defaultMax: 100  },
  { key: 'pvtemperature',label: 'Temperatura PigVision', unit: '°C',  defaultMin: 15,  defaultMax: 40   },
] as const;

export type EnvironmentalVariableKey = typeof ENVIRONMENTAL_VARIABLES[number]['key'];
export type PigVisionVariableKey = typeof PIGVISION_VARIABLES[number]['key'];

export function getVariableInfo(key: string) {
  const env = ENVIRONMENTAL_VARIABLES.find((v) => v.key === key);
  if (env) return { ...env, type: 'environmental' as AlertType };
  const pv = PIGVISION_VARIABLES.find((v) => v.key === key);
  if (pv) return { ...pv, type: 'pigvision' as AlertType };
  return null;
}

export function defaultChannels(): AlertChannelConfig {
  return {
    whatsapp: { enabled: false, recipients: [] },
    email:    { enabled: false, recipients: [] },
    sms:      { enabled: false, recipients: [] },
  };
}

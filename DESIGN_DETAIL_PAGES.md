# Internal Detail Pages Design Document

## Overview
This document outlines the design for internal detail pages following the existing codebase patterns and UI components.

## Design System Foundation

### Color Palette
- **Primary**: slate-900 (text), slate-50 (backgrounds)
- **Success**: green-500 (active, online)
- **Warning**: amber-500 (maintenance, pending)
- **Destructive**: red-500 (offline, errors, cancelled)
- **Info**: blue-500 (configured, links)
- **Muted**: slate-400 (placeholders, secondary text)

### Typography
- **Page Title**: text-2xl font-bold
- **Section Title**: text-lg font-semibold
- **Card Title**: text-base font-semibold
- **Body**: text-sm
- **Meta**: text-xs text-muted-foreground

### Spacing
- Page padding: p-6
- Card gaps: gap-6 (lg), gap-4 (mobile)
- Section spacing: space-y-6
- Card internal: space-y-4

---

## 1. Location Detail Page (Enhanced)

**Route**: `/ubicaciones/[id]/`

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Locations              [Edit] [Delete]           │  ← PageHeader
├─────────────────────────────────────────────────────────────┤
│ Granja San José                              🏷️ Farm       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  📍 Carretera Nacional km 15                               │
│  🐷 Pigs                                                   │
│                                                             │
│  [View on Map]                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Hierarchy                                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Granja San José                                          │
│     ├─ Galpón 1 ─── [3 devices]                           │
│     │   ├─ Corral A                                       │
│     │   └─ Corral B                                       │
│     └─ Galpón 2                                           │
│         └─ Corral C                                       │
│                                                             │
│  [+ Add Barn]                                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Installed Devices                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ PigVision-001  │  │ Sensor-002      │                  │
│  │ ✅ Online      │  │ ✅ Online       │                  │
│  │ Corral A       │  │ Galpón 1        │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  [View All 5 Devices]                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Recent Activity                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  📅 Created: Jan 15, 2024                                  │
│  📝 Last edited: Feb 1, 2024                               │
│  ➕ Added Galpón 2: Jan 20, 2024                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure

```typescript
// app/(dashboard)/ubicaciones/[id]/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocationTree } from '@/components/locations/LocationTree';
import { DeviceMiniCard } from '@/components/devices/DeviceMiniCard';
import { MapPreview } from '@/components/locations/MapPreview';

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Granja San José"
        backHref="/ubicaciones"
        backLabel="Volver a ubicaciones"
        actions={[
          { label: 'Editar', href: `./editar`, variant: 'outline' },
          { label: 'Eliminar', variant: 'destructive', onClick: handleDelete }
        ]}
      />

      {/* Main Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <FarmIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Granja San José</CardTitle>
              <p className="text-sm text-muted-foreground">ID: LOC-001</p>
            </div>
          </div>
          <Badge variant="secondary">Farm</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">
                  Carretera Nacional km 15
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <PigIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Especie</p>
                <p className="text-sm text-muted-foreground">Pigs (Cerdos)</p>
              </div>
            </div>
          </div>
          <MapPreview coordinates={{ lat: -34.6037, lng: -58.3816 }} />
        </CardContent>
      </Card>

      {/* Hierarchy Tree */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Jerarquía</CardTitle>
          <Button variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Galpón
          </Button>
        </CardHeader>
        <CardContent>
          <LocationTree locationId={params.id} />
        </CardContent>
      </Card>

      {/* Devices Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dispositivos Instalados</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dispositivos?location=${params.id}`}>
              Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <DeviceMiniCard key={device.id} device={device} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 2. Batch (Lote) Detail Page (Enhanced)

**Route**: `/lotes/[id]/`

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Batches                [Edit] [Close Batch]      │  ← PageHeader
├─────────────────────────────────────────────────────────────┤
┌──────────────────────────────────┬──────────────────────────┐
│ Lote Ceba Enero 2024             │   🟢 Active              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━━━━━━━━━━ │
│                                  │                          │
│  📊 Status Overview              │   Quick Stats            │
│  ──────────────────────────────  │  ───────────────────────│
│                                  │                          │
│  🐷 Species: Pigs                │   1,250 animals         │
│  📅 Started: Jan 15, 2024        │   Day 18 of cycle        │
│  📆 Est. End: Mar 15, 2024       │   42 days remaining     │
│                                  │                          │
│  📈 Current Age: 88 days         │   Progress: ████████░░  │
│                                  │                          │
└──────────────────────────────────┴──────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Location Distribution                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  🏠 Granja San José                                       │
│     └─ Galpón 1                                           │
│         ├─ Corral A  (500 animals)                        │
│         └─ Corral B  (750 animals)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────┬──────────────────────────┐
│ 📊 Weight Devices                │ 🌡️ Environment Devices   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━━━━━━━━━━ │
│                                  │                          │
│  PigVision-001    ✅ Online      │  TempSensor-01  ✅       │
│  └─ Corral A                     │  └─ Galpón 1             │
│                                  │                          │
│  PigVision-002    ✅ Online      │  HumidSensor-02  ⚠️      │
│  └─ Corral B                     │  └─ Galpón 1             │
│                                  │                          │
└──────────────────────────────────┴──────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Performance Metrics                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Avg Weight  │ │ Mortality   │ │ Feed Conv.  │           │
│  │    85.3 kg  │ │    2.1%     │ │    2.45     │           │
│  │    +12%     │ │    ↓ 0.3%   │ │    ↓ 0.15   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Actions                                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  [Close Batch] [Export Data] [Print Report]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure

```typescript
// app/(dashboard)/lotes/[id]/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Lote Ceba Enero 2024"
        subtitle="ID: BATCH-001"
        backHref="/lotes"
        backLabel="Volver a lotes"
        actions={[
          { label: 'Editar', href: `./editar`, variant: 'outline' },
          { label: 'Cerrar Lote', onClick: () => setCloseDialogOpen(true) }
        ]}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del Lote</CardTitle>
                <BatchStatusBadge status={batch.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatItem 
                  icon={<PigIcon />}
                  label="Especie"
                  value="Cerdos"
                />
                <StatItem 
                  icon={<CalendarIcon />}
                  label="Fecha de inicio"
                  value="15 Ene 2024"
                />
                <StatItem 
                  icon={<UsersIcon />}
                  label="Cantidad inicial"
                  value="1,500 animales"
                />
                <StatItem 
                  icon={<ClockIcon />}
                  label="Edad inicial"
                  value="70 días"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del ciclo</span>
                  <span>18 de 60 días</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Location Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationDistribution 
                farm={batch.farm}
                barns={batch.barns}
                pens={batch.pens}
              />
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <MetricCard
                  title="Peso Promedio"
                  value="85.3 kg"
                  trend="+12%"
                  trendUp={true}
                />
                <MetricCard
                  title="Mortalidad"
                  value="2.1%"
                  trend="↓ 0.3%"
                  trendUp={false}
                />
                <MetricCard
                  title="Conversión"
                  value="2.45"
                  trend="↓ 0.15"
                  trendUp={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickStat 
                label="Animales actuales"
                value="1,250"
                subtext="-250 desde inicio"
              />
              <QuickStat 
                label="Edad actual"
                value="88 días"
                subtext="+18 días"
              />
              <QuickStat 
                label="Días restantes"
                value="42"
                subtext="Finaliza: 15 Mar"
              />
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dispositivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DeviceGroup 
                title="Pesaje"
                devices={weightDevices}
                icon={<ScaleIcon />}
              />
              <DeviceGroup 
                title="Ambiente"
                devices={environmentDevices}
                icon={<ThermometerIcon />}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Device Detail Page (Enhanced)

**Route**: `/dispositivos/[id]/`

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Devices                                              │
│ PV-001                                       [⚙️] [🗑️]       │  ← PageHeader
├─────────────────────────────────────────────────────────────┤
┌──────────────────────────────────┬──────────────────────────┐
│ Device Status                    │   Current Location       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━━━━━━━━━━ │
│                                  │                          │
│  📷 PigVision                    │   🏠 Granja San José     │
│                                  │   └─ Galpón 1            │
│  🟢 Online                       │       └─ Corral A        │
│                                  │                          │
│  State: In Production            │   [Change Location]      │
│  Last seen: 2 minutes ago        │                          │
│                                  │                          │
└──────────────────────────────────┴──────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Configuration                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Installation Height: 2.35 m                               │
│  Detection Zone: 3.2 m × 2.1 m                             │
│  Sensitivity: Medium                                       │
│  Last calibrated: Jan 20, 2024                             │
│                                                             │
│  [Edit Configuration]                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────┬──────────────────────────┐
│ Recent Measurements              │   Device Health          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━━━━━━━━━━ │
│                                  │                          │
│  📊 Last 24 hours                │   ✅ All systems normal  │
│                                  │                          │
│  ┌──────────────────────────┐   │   Connectivity: 98%      │
│  │    Weight Distribution   │   │   Battery: N/A           │
│  │      📈 [Chart]          │   │   Signal: Strong         │
│  └──────────────────────────┘   │                          │
│                                  │   [View Diagnostics]     │
│  Avg: 85.3 kg | Count: 247      │                          │
│                                  │                          │
└──────────────────────────────────┴──────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Activity History                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  🟢 Now         Online                                      │
│  📅 Jan 20      Configured by Admin                        │
│  📍 Jan 18      Moved to Corral A                          │
│  🔧 Jan 15      Maintenance completed                      │
│  ➕ Jan 10      Installed at Galpón 1                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Actions                                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  [Maintenance] [Uninstall] [Export Data]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure

```typescript
// app/(dashboard)/dispositivos/[id]/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceStateChip } from '@/components/devices/DeviceStateChip';
import { DeviceHealthIndicator } from '@/components/devices/DeviceHealthIndicator';
import { ActivityTimeline } from '@/components/devices/ActivityTimeline';
import { MeasurementsChart } from '@/components/devices/MeasurementsChart';

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={device.serialNumber}
        subtitle={device.type}
        backHref="/dispositivos"
        backLabel="Volver a dispositivos"
        actions={[
          { 
            label: 'Configurar', 
            href: `./configurar`, 
            variant: 'outline',
            icon: <SettingsIcon className="w-4 h-4" />
          },
          { 
            label: 'Eliminar', 
            variant: 'destructive',
            onClick: handleDelete
          }
        ]}
      />

      {/* Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                  <DeviceIcon type={device.type} className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-xl">{device.serialNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">
                    {device.type}
                  </p>
                </div>
              </div>
              <DeviceHealthBadge health={device.health} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <DeviceStateChip state={device.state} />
              <span className="text-sm text-muted-foreground">
                Última conexión: {formatDate(device.lastSeen)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubicación Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {device.location ? (
              <>
                <LocationBreadcrumb path={device.locationPath} />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ubicaciones/${device.locationId}`}>
                      Ver ubicación
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleChangeLocation}>
                    Cambiar
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState 
                icon={<MapPinOffIcon />}
                title="Sin ubicación"
                description="Este dispositivo no está instalado"
                action={{
                  label: 'Instalar',
                  onClick: () => router.push(`./instalar`)
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="measurements">Mediciones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <DeviceConfigSummary config={device.configuration} />
            </CardContent>
          </Card>

          {/* Health & Measurements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mediciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementsChart deviceId={params.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceHealthIndicator device={device} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline history={device.history} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 4. Project Detail Page (New Feature)

**Route**: `/proyectos/[id]/`

If you want to introduce a "Project" concept as a higher-level container:

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Projects               [Edit] [Archive]          │
├─────────────────────────────────────────────────────────────┤
│ Ciclo de Producción Q1 2024                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Proyecto de optimización de conversión alimenticia        │
│  en granjas del norte durante el primer trimestre.         │
│                                                             │
│  🟢 Active    📅 Jan 1 - Mar 31, 2024                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Associated Farms                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Granja San José                                    │   │
│  │ 3 barns • 12 pens • 3,500 animals                 │   │
│  │ Active batches: 2                                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Granja El Progreso                                 │   │
│  │ 2 barns • 8 pens • 2,200 animals                  │   │
│  │ Active batches: 1                                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Batches in this Project                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Lote A       │ Lote B       │ Lote C       │            │
│  │ 🟢 Active    │ 🟢 Active    │ ⚪ Planned   │            │
│  │ 1,500 🐷    │ 2,000 🐷    │ 1,800 🐷    │            │
│  │ Day 15       │ Day 8        │ -            │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Project Metrics                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Total Animals: 5,500                                      │
│  Avg Conversion: 2.42 (target: 2.30)                      │
│  Mortality Rate: 1.8%                                      │
│  Feed Consumption: 12.5 tons/day                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure

```typescript
// app/(dashboard)/proyectos/[id]/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  farmIds: string[];
  batchIds: string[];
  targets?: {
    feedConversion?: number;
    mortalityRate?: number;
    averageWeight?: number;
  };
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={project.name}
        backHref="/proyectos"
        backLabel="Volver a proyectos"
        actions={[
          { label: 'Editar', href: `./editar`, variant: 'outline' },
          { 
            label: project.status === 'active' ? 'Completar' : 'Reactivar',
            onClick: handleStatusChange 
          }
        ]}
      />

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Descripción</CardTitle>
            <ProjectStatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{project.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span>{formatDateRange(project.startDate, project.endDate)}</span>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-muted-foreground" />
                <span>{getDaysRemaining(project.endDate)} días restantes</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Associated Farms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Granjas Asociadas</CardTitle>
          <Button variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Granja
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map(farm => (
              <FarmSummaryCard key={farm.id} farm={farm} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Associated Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Lotes del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map(batch => (
              <BatchCompactCard key={batch.id} batch={batch} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Animales"
              value="5,500"
              icon={<UsersIcon />}
            />
            <MetricCard
              title="Conversión Promedio"
              value="2.42"
              target="2.30"
              icon={<ScaleIcon />}
            />
            <MetricCard
              title="Mortalidad"
              value="1.8%"
              target="< 2%"
              icon={<AlertIcon />}
            />
            <MetricCard
              title="Consumo/Día"
              value="12.5 tn"
              icon={<PackageIcon />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Reusable Components

### MetricCard
```typescript
// components/shared/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, trend, trendUp, icon }: MetricCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className={cn(
          "text-xs mt-1",
          trendUp ? "text-green-600" : "text-red-600"
        )}>
          {trend}
        </div>
      )}
    </div>
  );
}
```

### LocationBreadcrumb
```typescript
// components/locations/LocationBreadcrumb.tsx
interface LocationBreadcrumbProps {
  path: Location[];
}

export function LocationBreadcrumb({ path }: LocationBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {path.map((location, index) => (
        <span key={location.id} className="flex items-center gap-2">
          {index > 0 && <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
          <span className={cn(
            index === path.length - 1 ? "font-medium" : "text-muted-foreground"
          )}>
            {location.name}
          </span>
        </span>
      ))}
    </div>
  );
}
```

### DeviceMiniCard
```typescript
// components/devices/DeviceMiniCard.tsx
interface DeviceMiniCardProps {
  device: Device;
}

export function DeviceMiniCard({ device }: DeviceMiniCardProps) {
  return (
    <Link href={`/dispositivos/${device.id}`}>
      <div className="p-4 rounded-lg border hover:border-primary transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <DeviceIcon type={device.type} className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">{device.serialNumber}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {device.type}
              </p>
            </div>
          </div>
          <DeviceHealthIndicator health={device.health} size="sm" />
        </div>
        {device.location && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPinIcon className="w-3 h-3" />
            {device.location.name}
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

## 6. Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Stack all cards vertically
- PageHeader actions in dropdown menu
- Hide secondary information in expandable sections

### Tablet (640px - 1024px)
- Two column grid for related cards
- Full PageHeader with visible actions
- Sidebar collapses to tabs

### Desktop (> 1024px)
- Three column layout for lists
- Sticky sidebar for quick actions
- Full-featured PageHeader

---

## 7. Interaction Patterns

### Loading States
- Skeleton screens for initial load
- Spinner for async actions
- Optimistic UI for mutations

### Empty States
- Consistent EmptyState component
- Contextual illustrations
- Clear CTAs

### Error States
- Error boundaries for crashes
- Toast notifications for mutations
- Inline validation for forms

### Success Feedback
- Toast notifications
- Progress indicators for long operations
- Automatic refresh of related data

---

## 8. File Organization

```
app/(dashboard)/
├── ubicaciones/
│   └── [id]/
│       ├── page.tsx           # Detail page
│       ├── layout.tsx         # Detail layout (optional)
│       ├── loading.tsx        # Loading state
│       └── error.tsx          # Error boundary
├── lotes/
│   └── [id]/
│       ├── page.tsx
│       ├── loading.tsx
│       └── error.tsx
└── dispositivos/
    └── [id]/
        ├── page.tsx
        ├── loading.tsx
        └── error.tsx

components/
├── locations/
│   ├── LocationBreadcrumb.tsx
│   ├── LocationTree.tsx
│   └── LocationSummaryCard.tsx
├── devices/
│   ├── DeviceMiniCard.tsx
│   ├── DeviceHealthIndicator.tsx
│   └── ActivityTimeline.tsx
└── shared/
    ├── MetricCard.tsx
    ├── QuickStat.tsx
    └── StatItem.tsx
```

---

## Summary

These designs follow the existing codebase patterns:

1. **Consistent Layout**: PageHeader + Cards grid
2. **Reusable Components**: MetricCard, LocationBreadcrumb, DeviceMiniCard
3. **Responsive**: Mobile-first with progressive enhancement
4. **Type-Safe**: Full TypeScript support
5. **i18n Ready**: All text extracted for translation
6. **Accessible**: Semantic HTML, ARIA labels
7. **Performance**: Loading states, error boundaries

The designs provide:
- Clear information hierarchy
- Contextual actions
- Visual feedback
- Consistent navigation
- Scalable architecture

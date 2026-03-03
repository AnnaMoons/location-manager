'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Edit, Trash2, MapPin, Cpu, Plus, Home, Warehouse, LayoutGrid, LucideIcon } from 'lucide-react';
import { canHaveChildren, getNextLevelType, speciesHierarchies, LocationType } from '@/lib/types/species';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { LocationCard } from '@/components/locations/LocationCard';
import { useLocations } from '@/lib/hooks/useLocations';
import { useDevices } from '@/lib/hooks/useDevices';
import { cn } from '@/lib/utils';

const speciesColors: Record<string, string> = {
  pigs: 'bg-pink-100 text-pink-700',
  broilers: 'bg-orange-100 text-orange-700',
  layers: 'bg-amber-100 text-amber-700',
};

const locationIcons: Record<LocationType, LucideIcon> = {
  farm: Home,
  barn: Warehouse,
  pen: LayoutGrid,
  section: LayoutGrid,
  cage: LayoutGrid,
};

export default function LocationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('locations');
  const router = useRouter();
  const { getLocation, getChildren, getPath, deleteLocation, isLoading } = useLocations();
  const { filterByLocation } = useDevices();

  const location = getLocation(id);
  const children = location ? getChildren(id) : [];
  const path = location ? getPath(id) : [];
  const devices = location ? filterByLocation(id) : [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!location) {
    return (
      <EmptyState
        icon={MapPin}
        title={t('notFound') || 'Ubicación no encontrada'}
        description="La ubicación que buscas no existe"
        actionLabel="Volver a ubicaciones"
        actionHref="/ubicaciones"
      />
    );
  }

  const handleDelete = async () => {
    await deleteLocation(id);
    router.push('/ubicaciones');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={location.name}
        subtitle={path.map((p) => p.name).join(' → ')}
        showBack
        backHref="/ubicaciones"
        actions={
          <div className="flex gap-2">
            <Link href={`/ubicaciones/${id}/editar`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('deleteWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      {/* Location Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              {(() => {
                const Icon = locationIcons[location.type] || Home;
                return <Icon className="h-6 w-6 text-primary" />;
              })()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{t(`types.${location.type}`)}</Badge>
                <Badge className={cn(speciesColors[location.species])}>
                  {t(`species.${location.species}`)}
                </Badge>
              </div>
              {location.address && (
                <p className="text-sm text-muted-foreground">{location.address}</p>
              )}
              {location.coordinates && (
                <p className="text-xs text-muted-foreground mt-1">
                  {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {t('devices')} ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noDevices')}
            </p>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <Link key={device.id} href={`/dispositivos/${device.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium">{device.serialNumber}</p>
                      <p className="text-sm text-muted-foreground">{device.type}</p>
                    </div>
                    <Badge variant={device.state === 'production' ? 'success' : 'secondary'}>
                      {device.state}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child Locations */}
      {canHaveChildren(location.species, location.type) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('childLocations')}</CardTitle>
              <Link href={`/ubicaciones/${id}/nueva`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar {t(`types.${getNextLevelType(location.species, location.type)}`)}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay ubicaciones hijas
              </p>
            ) : (
              <div className="space-y-2">
                {children.map((child) => (
                  <LocationCard key={child.id} location={child} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

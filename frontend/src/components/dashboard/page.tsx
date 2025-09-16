import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Ventas Totales" value="$12,345" icon="💰" />
        <StatsCard title="Órdenes" value="45" icon="📋" />
        <StatsCard title="Productos" value="128" icon="📦" />
        <StatsCard title="Clientes" value="89" icon="👥" />
      </div>

      {/* Acciones Rápidas centradas */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <QuickActions />
        </div>
      </div>

      {/* Espacio adicional para futuros componentes */}
      <div className="mt-8">
        {/* Aquí puedes agregar otros componentes más adelante */}
      </div>
    </DashboardLayout>
  );
}
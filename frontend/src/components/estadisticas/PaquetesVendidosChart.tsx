import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'
import type { PaqueteVendido } from '@/types/estadisticas'

interface Props {
  datos: PaqueteVendido[]
}

export default function PaquetesVendidosChart({ datos }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ESTADISTICAS_LABELS.paquetesVendidos}</CardTitle>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <p className="text-center text-gray-400 py-8">{ESTADISTICAS_LABELS.sinDatos}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datos} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={75} />
              <Tooltip />
              <Bar dataKey="total" name={ESTADISTICAS_LABELS.ventas} fill="#10b981" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'
import type { ClientesPorMes } from '@/types/estadisticas'

interface Props {
  datos: ClientesPorMes[]
}

export default function ClientesPorMesChart({ datos }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ESTADISTICAS_LABELS.clientesPorMes}</CardTitle>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <p className="text-center text-gray-400 py-8">{ESTADISTICAS_LABELS.sinDatos}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="cantidad" name={ESTADISTICAS_LABELS.cantidad} fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

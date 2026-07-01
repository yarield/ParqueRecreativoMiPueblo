import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useGanancias } from '@/hooks/useEstadisticas'
import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'

export default function GananciasChart() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<{ desde?: string; hasta?: string }>({})

  const { data: datos = [] } = useGanancias(filtroActivo.desde, filtroActivo.hasta)

  function aplicarFiltro() {
    setFiltroActivo({ desde: desde || undefined, hasta: hasta || undefined })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ESTADISTICAS_LABELS.gananciasPorMes}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{ESTADISTICAS_LABELS.desde}</Label>
            <Input type="date" className="w-40 h-8 text-sm" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{ESTADISTICAS_LABELS.hasta}</Label>
            <Input type="date" className="w-40 h-8 text-sm" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <Button size="sm" onClick={aplicarFiltro}>{ESTADISTICAS_LABELS.filtrar}</Button>
        </div>

        {datos.length === 0 ? (
          <p className="text-center text-gray-400 py-8">{ESTADISTICAS_LABELS.sinDatos}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datos} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, ESTADISTICAS_LABELS.ganancias]} />
              <Bar dataKey="total" name={ESTADISTICAS_LABELS.ganancias} fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

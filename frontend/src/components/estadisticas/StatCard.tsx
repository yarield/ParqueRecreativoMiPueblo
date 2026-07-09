import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatCardProps } from './estadisticas.types'

export default function StatCard({ titulo, valor, subtitulo }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
      </CardContent>
    </Card>
  )
}

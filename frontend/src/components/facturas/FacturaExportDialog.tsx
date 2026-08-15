import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { facturaExportSchema } from '@/schemas/facturasExport.schema'
import { EXPORTAR_LABELS, EXPORTAR_MESSAGES } from '@/constants/exportar.constants'
import type { FacturaExportFormData } from '@/schemas/facturasExport.schema'
import type { FacturaExportDialogProps } from './facturas.types'

// El mes en curso y su día 1: valores iniciales razonables para no obligar a
// escribir fechas en el caso más común (cerrar el mes actual).
const hoy = () => new Date().toISOString().slice(0, 10)
const mesActual = () => new Date().toISOString().slice(0, 7)
const primerDiaDelMes = () => `${mesActual()}-01`

export default function FacturaExportDialog({ open, onClose, onExportar }: FacturaExportDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const { handleSubmit, register, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<FacturaExportFormData>({
      resolver: zodResolver(facturaExportSchema) as Resolver<FacturaExportFormData>,
      defaultValues: { modo: 'mes', desde: primerDiaDelMes(), hasta: hoy(), mes: mesActual() },
    })

  const modo = watch('modo')

  useEffect(() => {
    if (!open) return
    setFormError(null)
    reset({ modo: 'mes', desde: primerDiaDelMes(), hasta: hoy(), mes: mesActual() })
  }, [open, reset])

  const ayuda =
    modo === 'rango'
      ? EXPORTAR_LABELS.ayudaRango
      : modo === 'mes'
        ? EXPORTAR_LABELS.ayudaMes
        : EXPORTAR_LABELS.ayudaTotal

  async function handleFormSubmit(data: FacturaExportFormData) {
    setFormError(null)
    try {
      await onExportar(data)
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : EXPORTAR_MESSAGES.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{EXPORTAR_LABELS.titulo}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {formError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <Label>{EXPORTAR_LABELS.periodo}</Label>
            <Select value={modo} onValueChange={(v) => setValue('modo', v as FacturaExportFormData['modo'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rango">{EXPORTAR_LABELS.modoRango}</SelectItem>
                <SelectItem value="mes">{EXPORTAR_LABELS.modoMes}</SelectItem>
                <SelectItem value="total">{EXPORTAR_LABELS.modoTotal}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{ayuda}</p>
          </div>

          {modo === 'rango' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{EXPORTAR_LABELS.desde}</Label>
                <Input type="date" {...register('desde')} />
                {errors.desde && <p className="text-xs text-red-500">{errors.desde.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>{EXPORTAR_LABELS.hasta}</Label>
                <Input type="date" {...register('hasta')} />
                {errors.hasta && <p className="text-xs text-red-500">{errors.hasta.message}</p>}
              </div>
            </div>
          )}

          {modo === 'mes' && (
            <div className="space-y-1">
              <Label>{EXPORTAR_LABELS.mes}</Label>
              <Input type="month" {...register('mes')} />
              {errors.mes && <p className="text-xs text-red-500">{errors.mes.message}</p>}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {EXPORTAR_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? EXPORTAR_MESSAGES.exportando : EXPORTAR_MESSAGES.exportar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

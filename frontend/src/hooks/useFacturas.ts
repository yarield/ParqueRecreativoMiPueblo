import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Factura } from '@/types/facturas'
import type { FacturaFormData } from '@/schemas/facturas.schema'

const QUERY_KEY = 'facturas'

export function useFacturas() {
  return useQuery<Factura[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<Factura[]>('/facturas'),
  })
}

export function useCreateFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FacturaFormData) => api.post<Factura>('/facturas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })
}

export function useUpdateFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FacturaFormData> }) =>
      api.put<Factura>(`/facturas/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/facturas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

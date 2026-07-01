import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Paquete } from '@/types/paquetes'
import type { PaqueteFormData } from '@/schemas/paquetes.schema'

const QUERY_KEY = 'paquetes'

export function usePaquetes() {
  return useQuery<Paquete[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<Paquete[]>('/paquetes'),
  })
}

export function useCreatePaquete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PaqueteFormData) => api.post<Paquete>('/paquetes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdatePaquete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaqueteFormData> }) =>
      api.put<Paquete>(`/paquetes/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeletePaquete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/paquetes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

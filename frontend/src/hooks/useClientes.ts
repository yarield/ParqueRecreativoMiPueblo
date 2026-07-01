import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Cliente, ClienteConFacturas } from '@/types/clientes'
import type { ClienteFormData } from '@/schemas/clientes.schema'

const QUERY_KEY = 'clientes'

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<Cliente[]>('/clientes'),
  })
}

export function useCliente(id: number | null) {
  return useQuery<ClienteConFacturas>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<ClienteConFacturas>(`/clientes/${id}`),
    enabled: id !== null,
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteFormData) => api.post<Cliente>('/clientes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClienteFormData> }) =>
      api.put<Cliente>(`/clientes/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/clientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

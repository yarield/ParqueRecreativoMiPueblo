import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Categoria } from '@/types/categorias'
import type { CategoriaFormData } from '@/schemas/categorias.schema'

const QUERY_KEY = 'categorias'

export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<Categoria[]>('/categorias'),
  })
}

export function useCreateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoriaFormData) => api.post<Categoria>('/categorias', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaFormData }) =>
      api.put<Categoria>(`/categorias/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/categorias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['paquetes'] })
    },
  })
}

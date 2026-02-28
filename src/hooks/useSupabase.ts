import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Hook para buscar dados
export const useSupabaseData = (table: string) => {
    return useQuery({
        queryKey: [table],
        queryFn: async () => {
            const { data, error } = await supabase.from(table).select('*');
            if (error) throw error;
            return data;
        },
    });
};

// Hook para inserir dados
export const useSupabaseInsert = (table: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newData: any) => {
            const { data, error } = await supabase.from(table).insert(newData).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] });
        },
    });
};

// Hook para deletar dados
export const useSupabaseDelete = (table: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] });
        },
    });
};

// Hook para atualizar dados
export const useSupabaseUpdate = (table: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string | number; updates: any }) => {
            const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] });
        },
    });
};

// Hook para upsert (inserir ou atualizar) dados
export const useSupabaseUpsert = (table: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newData: any) => {
            const { data, error } = await supabase.from(table).upsert(newData).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] });
        },
    });
};

import { apiClient } from "./api.ts";
const API_BASE_URL = '/posts';
export const CardService = {
    getPosts: <T>(page: number, limit: number, userId?: number) => {
        let url = `${API_BASE_URL}?_page=${page}&_limit=${limit}`;
        if (userId !== undefined && userId !== null) {
            url += `&userId=${userId}`;
        }
        return apiClient.get<T>(url);
    },
    getPost: <T>(id: number) => apiClient.get<T>(`${API_BASE_URL}/${id}`),
    createPost: <T>(data: unknown) => apiClient.post<T>(`${API_BASE_URL}`, data),
    replacePost: <T>(id: number, data: unknown) => apiClient.put<T>(`${API_BASE_URL}/${id}`, data),
    updatePost: <T>(id: number, data: unknown) => apiClient.patch<T>(`${API_BASE_URL}/${id}`, data),
    deletePost: <T>(id: number) => apiClient.delete<T>(`${API_BASE_URL}/${id}`)
};

export default CardService;


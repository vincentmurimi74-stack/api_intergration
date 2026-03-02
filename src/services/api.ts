import axios, {AxiosRequestConfig} from 'axios';

type TApiClient = {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined>;
    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined>;
    patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined>;
    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined>;
};

const axiosInstance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com/', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient: TApiClient = {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.get(url, config);
        return response.data as T | undefined;
    },

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.post(url, data, config);
        return response.data as T | undefined;
    },

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.patch(url, data, config);
        return response.data as T | undefined;
    },

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.put(url, data, config);
        return response.data as T | undefined;
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.delete(url, config);
        return response.data as T | undefined;
    },
};

export default axiosInstance;
import { apiClient } from "./api";
const API_BASE_URL = '/users';

export const UserService = {
    getUsers: <T>() => apiClient.get<T>(`${API_BASE_URL}`),
};

export default UserService;

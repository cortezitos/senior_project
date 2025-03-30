import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        const { response } = error;
        if (response && response.status === 401) {
            localStorage.removeItem("ACCESS_TOKEN");
        }
        throw error;
    }
);

export default axiosClient;

import axios from "axios";

type AuthTokenGetter = () => Promise<string | null>;

let authTokenGetter: AuthTokenGetter | null = null;

export const setAuthTokenGetter = (getter: AuthTokenGetter | null) => {
	authTokenGetter = getter;
};

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

axiosInstance.interceptors.request.use(async (config) => {
	if (!authTokenGetter) return config;

	const token = await authTokenGetter();
	if (!token) return config;

	config.headers = config.headers ?? {};
	config.headers.Authorization = `Bearer ${token}`;

	return config;
});

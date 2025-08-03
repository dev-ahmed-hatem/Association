import { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { AxiosRequestConfig, type AxiosError } from "axios";
import getCookie from "@/utils/getCookie";
import { storeTokens } from "@/utils/storage";

const api_base_url = import.meta.env.VITE_API_BASE_URL;

interface CustomAxiosConfig extends AxiosRequestConfig {
  _retry: true;
}

export type axiosBaseQueryError = {
  status: number | string;
  data: any;
};

export const axiosInstance = axios.create({
  baseURL: api_base_url,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ar-eg",
  },
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "x-CSRFToken",
});

axiosInstance.interceptors.request.use((config) => {
  // include csrftoken (not activated in this system)
  // const csrftoken = getCookie("csrftoken");
  // config.headers["X-CSRFToken"] = csrftoken;

  const access = localStorage.getItem("access");
  if (access) {
    config.headers["Authorization"] = `Bearer ${access}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original_request = error.config as any;

    if (error.response?.status === 401 && !original_request._retry) {
      original_request._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
          throw new Error();
        }

        const refreshResponse = await axios.post(
          `${api_base_url}/auth/refresh/`,
          { refresh: refreshToken }
        );

        storeTokens(refreshResponse.data);

        // Update Authorization header for retried request
        original_request.headers = {
          ...original_request.headers,
          Authorization: `Bearer ${refreshResponse.data.access}`,
        };

        return axiosInstance(original_request);
      } catch (err) {
        // console.error(err);
        // console.log("hrer");
        // window.location.href = "/login";
        /////// use redirect in auth provider instead
      }
    }
    return Promise.reject(error);
  }
);

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: AxiosRequestConfig["url"];
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    axiosBaseQueryError
  > =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const response = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      });
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      console.log(axiosError); // remove in production

      return {
        error: {
          status: axiosError.response?.status || "UNKNOWN_ERROR",
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

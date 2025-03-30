import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Middleware types
export type RequestMiddleware = (
    config: AxiosRequestConfig
) => AxiosRequestConfig;
export type ResponseMiddleware = (response: AxiosResponse) => AxiosResponse;
export type ErrorMiddleware = (error: any) => Promise<any>;

// Middleware class to enhance axios instances
export class AxiosMiddleware {
    private instance: AxiosInstance;
    private requestMiddlewares: RequestMiddleware[] = [];
    private responseMiddlewares: ResponseMiddleware[] = [];
    private errorMiddlewares: ErrorMiddleware[] = [];

    constructor(config?: AxiosRequestConfig) {
        this.instance = axios.create(config);
        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                return this.requestMiddlewares.reduce(
                    (acc, middleware) => middleware(acc),
                    config
                );
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => {
                return this.responseMiddlewares.reduce(
                    (acc, middleware) => middleware(acc),
                    response
                );
            },
            async (error) => {
                let processedError = error;

                for (const middleware of this.errorMiddlewares) {
                    try {
                        return await middleware(processedError);
                    } catch (e) {
                        processedError = e;
                    }
                }

                return Promise.reject(processedError);
            }
        );
    }

    // Add request middleware
    addRequestMiddleware(middleware: RequestMiddleware): this {
        this.requestMiddlewares.push(middleware);
        return this;
    }

    // Add response middleware
    addResponseMiddleware(middleware: ResponseMiddleware): this {
        this.responseMiddlewares.push(middleware);
        return this;
    }

    // Add error middleware
    addErrorMiddleware(middleware: ErrorMiddleware): this {
        this.errorMiddlewares.push(middleware);
        return this;
    }

    // Get the axios instance
    getInstance(): AxiosInstance {
        return this.instance;
    }
}

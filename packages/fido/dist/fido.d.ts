interface Fido {
    get?: (url: string, query?: any, object?: any) => Promise<{
        response: Response;
        body: any;
    }>;
    post?: (url: string, query?: any, object?: any) => Promise<{
        response: Response;
        body: any;
    }>;
    put?: (url: string, query?: any, object?: any) => Promise<{
        response: Response;
        body: any;
    }>;
    delete?: (url: string, query?: any, object?: any) => Promise<{
        response: Response;
        body: any;
    }>;
    poll?: (url: string, query?: any, object?: any, condition?: (response: Response, body: any) => Promise<boolean>) => Promise<{
        response: Response;
        body: any;
    }>;
}
declare const fido: Fido;

export { fido };

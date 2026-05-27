export interface DevServerOptions {
    cwd: string;
    port: number;
}
export declare function startDevServer(options: DevServerOptions): Promise<{
    url: string;
    close: () => Promise<void>;
}>;

declare enum SpanStatus {
    Started = "Started",
    Stopped = "Stopped"
}
declare class Span {
    name: string;
    id: number;
    parentId?: number;
    duration: number | null;
    attributes: Record<string, unknown>;
    status: SpanStatus;
    private _start;
    constructor({ name, parentId, attributes, startTime }: {
        name: string;
        parentId?: number;
        startTime?: bigint;
        attributes?: Record<string, unknown>;
    });
    stop(stopTime?: bigint): void;
    traceChild(name: string, attributes?: Record<string, unknown>): Span;
    manualTraceChild(name: string, startTime: bigint, stopTime: bigint, attributes?: Record<string, unknown>): void;
    setAttribute(key: string, value: unknown): void;
    traceFunction<T>(fn: () => T): T;
    traceAsyncFunction<T>(fn: () => Promise<T> | T): Promise<T>;
}
declare function trace(name: string, parentId?: number, attributes?: Record<string, string>): Span;

export { trace };

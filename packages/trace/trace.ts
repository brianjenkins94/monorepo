// FROM: https://github.com/vercel/next.js/blob/canary/packages/next/trace/trace.ts

const NUMBER_OF_MILLISECONDS_IN_A_NANOSECOND = BigInt(1_000_000);

let count = 0;

function getId() {
	count += 1;

	return count;
}

enum SpanStatus {
	Started = "Started",
	Stopped = "Stopped"
}

class Span {
	public name: string;
	public id: number;
	public parentId?: number;
	public duration: number | null;
	public attributes: Record<string, unknown>;
	public status: SpanStatus;
	private _start: bigint;

	public constructor({ name, parentId, attributes = {}, startTime }: { name: string; parentId?: number; startTime?: bigint; attributes?: Record<string, unknown> }) {
		this.name = name;
		this.parentId = parentId;
		this.duration = null;
		this.attributes = attributes;
		this.status = SpanStatus.Started;
		this.id = getId();
		this._start = startTime ?? process.hrtime.bigint();
	}

	public stop(stopTime?: bigint) {
		const end: bigint = stopTime ?? process.hrtime.bigint();

		const duration = (end - this._start) / NUMBER_OF_MILLISECONDS_IN_A_NANOSECOND;

		this.status = SpanStatus.Stopped;

		console.log(this.name + " - " + (duration) + " ms");
	}

	public traceChild(name: string, attributes?: Record<string, unknown>) {
		return new Span({ "name": name, "parentId": this.id, "attributes": attributes });
	}

	public manualTraceChild(name: string, startTime: bigint, stopTime: bigint, attributes?: Record<string, unknown>) {
		const span = new Span({ "name": name, "parentId": this.id, "attributes": attributes, "startTime": startTime });

		span.stop(stopTime);
	}

	public setAttribute(key: string, value: unknown) {
		this.attributes[key] = String(value);
	}

	public traceFunction<T>(fn: () => T): T {
		try {
			return fn();
		} finally {
			this.stop();
		}
	}

	public async traceAsyncFunction<T>(fn: () => Promise<T> | T): Promise<T> {
		try {
			return await fn();
		} finally {
			this.stop();
		}
	}
}

export function trace(name: string, parentId?: number, attributes?: Record<string, string>) {
	return new Span({ "name": name, "parentId": parentId, "attributes": attributes });
}

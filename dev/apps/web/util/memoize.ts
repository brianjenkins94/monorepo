const MEMOIZED_VALUE_KEY = "_memoizedValue";

export function clearMemoizedValue(fn) {
	delete fn[MEMOIZED_VALUE_KEY];

	console.log("Cleared!");
}

export function memoize(fn, expiration: number | Date = 60_000) {
	if (expiration instanceof Date) {
		const now = new Date();

		expiration = new Date(expiration).getTime() - now.getTime();
	}

	return async function(...args) {
		// WARN: This will fail on non-homomorphic inputs.
		const key = JSON.stringify(args);

		fn[MEMOIZED_VALUE_KEY] ??= {};

		if (fn[MEMOIZED_VALUE_KEY][key] === undefined) {
			console.log("Cache miss!");

			fn[MEMOIZED_VALUE_KEY][key] = await fn(...args);

			setTimeout(function() {
				delete fn[MEMOIZED_VALUE_KEY][key];
			}, expiration as number);
		} else {
			console.log("Cache hit!");
		}

		return fn[MEMOIZED_VALUE_KEY][key];
	};
}

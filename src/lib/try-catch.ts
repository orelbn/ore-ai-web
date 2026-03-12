type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = unknown> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

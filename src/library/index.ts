export const never = new Promise<never>(() => {});

export type SegmentAbortCallback = () => void;

export type Segment<T, TPrevious> = (value: TPrevious) => Promise<T> | T;

export class SegmentedClass<T, TPrevious> {
  private promise: Promise<T>;

  constructor(
    segment: Segment<T, TPrevious>,
    previousPromise: Promise<TPrevious> | undefined,
    private context: SegmentedContext,
  ) {
    if (previousPromise) {
      this.promise = previousPromise.then(value => {
        if (context.aborted) {
          return never;
        }

        return segment(value);
      });
    } else {
      this.promise = Promise.resolve(segment(undefined as TPrevious));
    }
  }

  then<TNext>(segment: Segment<TNext, T>): Segmented<TNext>;
  /**
   * This overload is added for `await` compatibility.
   */
  then(
    onFulfilled: (value: T) => unknown,
    onRejected: (error: unknown) => unknown,
  ): Promise<unknown>;
  then(
    ...args:
      | [Segment<unknown, T>]
      | [(value: T) => unknown, (error: unknown) => unknown]
  ): Segmented<unknown> | Promise<unknown> {
    const {promise, context} = this;

    if (args.length === 1) {
      const [segment] = args;

      const segmented = new SegmentedClass(segment, promise, context);

      return buildSegmentedAbortCallable(segmented);
    } else {
      const [onFulfilled, onRejected] = args;

      return promise.then(onFulfilled, onRejected);
    }
  }

  abort(): void {
    const {context} = this;

    context.aborted = true;
  }
}

export type Segmented<T> = SegmentAbortCallback & SegmentedClass<T, unknown>;

export type SegmentedContext = {
  aborted: boolean;
};

export function segment<TReturn>(
  segment: Segment<TReturn, void>,
): Segmented<TReturn> {
  const segmented = new SegmentedClass(segment, undefined, {
    aborted: false,
  });

  return buildSegmentedAbortCallable(segmented);
}

function buildSegmentedAbortCallable<T>(
  segmented: SegmentedClass<T, unknown>,
): Segmented<T> {
  const callable: SegmentAbortCallback = () => segmented.abort();

  Object.setPrototypeOf(callable, segmented);

  return callable as Segmented<T>;
}

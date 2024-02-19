const NEVER = new Promise<never>(() => {});

export type Segment<T, TReturn> = (value: T) => Promise<TReturn>;

export class SegmentedClass<T> {
  private aborted = false;

  constructor(
    private previousPromise: Promise<T>,
    private previousSegmented: SegmentedClass<unknown> | undefined,
  ) {}

  get callable(): Segmented<T> {
    const abort = (): void => this.abort();

    Object.setPrototypeOf(abort, this);

    return abort as Segmented<T>;
  }

  then<TReturn>(
    segment: Segment<T, TReturn>,
    onRejected?: (error: unknown) => TReturn,
  ): Segmented<TReturn> {
    const promise = this.previousPromise.then(value => {
      if (this.aborted) {
        return NEVER;
      }

      return segment(value);
    }, onRejected);

    return new SegmentedClass(promise, this).callable;
  }

  abort(): void {
    if (this.aborted) {
      return;
    }

    this.aborted = true;

    this.previousSegmented?.abort();
  }
}

export type Segmented<T> = (() => void) & SegmentedClass<T>;

export function segment<TReturn>(
  segment: Segment<void, TReturn>,
): Segmented<TReturn> {
  const promise = segment();

  return new SegmentedClass(promise, undefined).callable;
}

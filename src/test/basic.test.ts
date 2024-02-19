import {jest} from '@jest/globals';
import type {AssertTrue, IsEqual} from 'tslang';

import {segment} from '../library/index.js';

test('basic', async () => {
  const result = await segment(async () => 'hello').then(value => value.length);

  type _Assert = AssertTrue<IsEqual<typeof result, number>>;

  expect(result).toBe(5);
});

test('abort immediately', async () => {
  const fn_1 = jest.fn(async () => {});
  const fn_2 = jest.fn(async () => {});

  const segmented = segment(fn_1).then(fn_2);

  segmented.abort();

  await expect(
    Promise.race([
      segmented,
      new Promise((_resolve, reject) => setTimeout(reject, 100, 'timeout')),
    ]),
  ).rejects.toBe('timeout');

  expect(fn_1).toHaveBeenCalled();
  expect(fn_2).not.toHaveBeenCalled();
});

test('abort immediately by callable', async () => {
  const fn_1 = jest.fn(async () => {});
  const fn_2 = jest.fn(async () => {});

  const segmented = segment(fn_1).then(fn_2);

  segmented();

  await expect(
    Promise.race([
      segmented,
      new Promise((_resolve, reject) => setTimeout(reject, 100, 'timeout')),
    ]),
  ).rejects.toBe('timeout');

  expect(fn_1).toHaveBeenCalled();
  expect(fn_2).not.toHaveBeenCalled();
});

test('abort later', async () => {
  const fn_1 = jest.fn(async () => {});
  const fn_2 = jest.fn(async () => {
    segmented.abort();
  });
  const fn_3 = jest.fn(async () => {});

  const segmented = segment(fn_1).then(fn_2).then(fn_3);

  await expect(
    Promise.race([
      segmented,
      new Promise((_resolve, reject) => setTimeout(reject, 100, 'timeout')),
    ]),
  ).rejects.toBe('timeout');

  expect(fn_1).toHaveBeenCalled();
  expect(fn_2).toHaveBeenCalled();
  expect(fn_3).not.toHaveBeenCalled();
});

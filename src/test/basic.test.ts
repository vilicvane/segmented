import {segment} from '../library/index.js';

test('basic', async () => {
  const segmented = await segment(async () => 'hello').then(
    async value => value.length,
  );

  expect(segmented).toBe(5);
});

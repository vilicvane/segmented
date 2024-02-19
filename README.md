[![NPM version](https://img.shields.io/npm/v/segmented?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/segmented)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilicvane/segmented?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-999999?style=flat-square)](./LICENSE)
[![Discord](https://img.shields.io/badge/chat-discord-5662f6?style=flat-square)](https://discord.gg/wEVn2qcf8h)

# Segmented

Segmented async operations to abort.

## Installation

```sh
npm install segmented
```

## Usage

```ts
import {segment} from 'segmented';

const segmented = segment(() => fetch('https://example.com'))
  .then(response => response.json())
  .then(console.log);

segmented.abort();
```

The `segmented` object returned is also an callable equivalent to `abort()` method:

```ts
import {segment} from 'segmented';

useEffect(
  () =>
    segment(() => fetch('https://example.com'))
      .then(response => response.json())
      .then(console.log),
  [],
);
```

## License

MIT License.

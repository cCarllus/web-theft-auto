import { describe, expect, it } from 'vitest';

import { indexSelectedFiles } from './install-source';

function pickedFile(path: string, bytes: readonly number[]): File {
  const blob = new Blob([new Uint8Array(bytes)]);
  const file = blob as File;
  const parts = path.split('/');
  Object.defineProperties(file, {
    name: { value: parts[parts.length - 1] ?? path },
    webkitRelativePath: { value: path },
  });

  return file;
}

describe('indexSelectedFiles', () => {
  it('strips the common selected root and normalizes paths to lowercase', async () => {
    const files = indexSelectedFiles([
      pickedFile('GTA San Andreas/models/GTA3.IMG', [1, 2, 3]),
      pickedFile('GTA San Andreas/DATA/GTA.DAT', [4, 5]),
    ]);

    expect([...files.keys()]).toEqual(['models/gta3.img', 'data/gta.dat']);
    expect(Array.from(await files.get('data/gta.dat')!.read())).toEqual([4, 5]);
  });

  it('preserves paths when the browser already reports them relative to the selected root', () => {
    const files = indexSelectedFiles([pickedFile('models/gta3.img', [1]), pickedFile('data/gta.dat', [2])]);

    expect([...files.keys()]).toEqual(['models/gta3.img', 'data/gta.dat']);
  });
});

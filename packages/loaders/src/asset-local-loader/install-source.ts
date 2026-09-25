/**
 * File System Access wiring for {@link InstallSource} (plan 053, phase 5). Walks the user-picked raw GTA
 * install once to index every file handle, opens `gta3.img` (+ optional `gta_int.img`) as lazy VER2 archives,
 * and serves loose files on demand. The model/anim archives are excluded from the loose set (their bytes come
 * through the lazy reader / aren't used). Chromium-only.
 */
import type { InstallSource } from './build-vfs';
import type { LocalInstallSelection } from './dir-handle-store';
import type { ByteRangeSource } from './img-reader';

import { fileHandleSource, fileSource, openLazyVer2 } from './img-reader';

const GTA3 = 'models/gta3.img';
const GTA_INT = 'models/gta_int.img';
/** Archives served lazily or unused — kept out of the loose-file set. */
const EXCLUDED = new Set(['anim/anim.img', GTA3, GTA_INT]);

interface InstallFile {
  read(): Promise<Uint8Array>;
  source(): Promise<ByteRangeSource>;
}

/** Build an {@link InstallSource} over either browser directory picker (opens IMG archives lazily). */
export async function browserInstallSource(selection: LocalInstallSelection): Promise<InstallSource> {
  const files = isFileSelection(selection) ? indexSelectedFiles(selection) : await indexHandleFiles(selection);

  const gta3File = files.get(GTA3);
  if (!gta3File) {
    throw new Error('models/gta3.img not found — pick the GTA San Andreas install folder');
  }
  const gta3 = await openLazyVer2(await gta3File.source());
  const gtaIntFile = files.get(GTA_INT);
  const gtaInt = gtaIntFile ? await openLazyVer2(await gtaIntFile.source()) : null;

  const loose = [...files.keys()].filter((path) => !EXCLUDED.has(path) && !path.endsWith('.ds_store'));
  const readLoose = async (path: string): Promise<Uint8Array> => {
    const file = files.get(path);
    if (!file) {
      throw new Error(`loose file not found: ${path}`);
    }

    return file.read();
  };

  return {
    gta3,
    gtaInt,
    looseFiles: () => Promise.resolve(loose),
    readLoose,
    readLooseText: async (path) => new TextDecoder().decode(await readLoose(path)),
  };
}

/** Convert directory-input files into the same lowercased relative-path index as File System Access. */
export function indexSelectedFiles(selected: readonly File[]): Map<string, InstallFile> {
  const raw = selected.map((file) => ({
    file,
    path: (file.webkitRelativePath || file.name).replace(/\\/g, '/').replace(/^\.\//, ''),
  }));
  const root = raw[0]?.path.split('/')[0] ?? '';
  const commonRoot = root && raw.every(({ path }) => path.startsWith(`${root}/`)) ? `${root}/` : '';

  return new Map(
    raw.map(({ file, path }) => {
      const relative = (commonRoot ? path.slice(commonRoot.length) : path).toLowerCase();

      return [
        relative,
        {
          read: async () => new Uint8Array(await file.arrayBuffer()),
          source: () => Promise.resolve(fileSource(file)),
        },
      ] as const;
    }),
  );
}

async function indexHandleFiles(dir: FileSystemDirectoryHandle): Promise<Map<string, InstallFile>> {
  const files = new Map<string, InstallFile>();
  for await (const file of walkFiles(dir)) {
    const handle = file.handle;
    files.set(file.path, {
      read: async () => new Uint8Array(await (await handle.getFile()).arrayBuffer()),
      source: () => fileHandleSource(handle),
    });
  }

  return files;
}

function isFileSelection(selection: LocalInstallSelection): selection is readonly File[] {
  return Array.isArray(selection);
}

/** Recursively yield every file handle under `dir` with its lowercased, `/`-joined relative path. */
async function* walkFiles(
  dir: FileSystemDirectoryHandle,
  prefix = '',
): AsyncGenerator<{ handle: FileSystemFileHandle; path: string }> {
  for await (const entry of dir.values()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      yield { handle: entry, path: path.toLowerCase() };
    } else {
      yield* walkFiles(entry, path);
    }
  }
}

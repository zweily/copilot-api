import { PATHS } from "./paths"

interface CacheEntry {
  value: string
  createdAt: number
}

type Cache = Record<string, CacheEntry>

const readCache = async () => {
  const content = await Bun.file(PATHS.PATH_CACHE_FILE).text()
  return JSON.parse(content) as Cache
}

const writeCache = (cache: Cache) =>
  Bun.write(PATHS.PATH_CACHE_FILE, JSON.stringify(cache))

const setCache = async (key: string, value: string) => {
  const cache = await readCache()
  cache[key] = {
    value,
    createdAt: Date.now(),
  }

  return writeCache(cache)
}

const getCache = async (key: string): Promise<CacheEntry | undefined> => {
  const cache = await readCache()
  return cache[key]
}

export const CACHE = {
  get: getCache,
  set: setCache,

  // Lower level methods
  _read: readCache,
  _write: writeCache,
}

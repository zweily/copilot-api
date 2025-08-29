import { proxyFetch } from "~/lib/proxy-fetch";

const FALLBACK = "1.98.1";

export async function getVSCodeVersion() {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    const response = await proxyFetch(
      "https://aur.archlinux.org/cgit/aur.git/plain/PKGBUILD?h=visual-studio-code-bin",
      {
        signal: controller.signal,
      },
    );

    const pkgbuild = await response.text();
    const pkgverRegex = /pkgver=([0-9.]+)/;
    const match = pkgbuild.match(pkgverRegex);

    if (match) {
      return match[1];
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  } finally {
    clearTimeout(timeout);
  }
}

await getVSCodeVersion();

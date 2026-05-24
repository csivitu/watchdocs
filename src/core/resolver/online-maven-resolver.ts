import { Dependency, DocResult } from "../../models";

type MavenSearchResponse = {
  response?: {
    docs?: Array<{
      g: string
      a: string
      latestVersion?: string
      homepage?: string
    }>
  }
}

export async function onlineMavenResolver(
  dependency: Dependency
): Promise<DocResult | null> {
  const [groupId, artifactId] = dependency.name.split(":");

  if (!groupId || !artifactId) {return null;}

  try {
    const query = `g:"${groupId}" AND a:"${artifactId}"`;

    const url =
      `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(query)}` +
      `&rows=1&wt=json`;

    const res = await fetch(url);
    if (!res.ok) {return null;}

    const data = (await res.json()) as MavenSearchResponse;
    const doc = data?.response?.docs?.[0];

    if (!doc) {return null;}

    const docUrl =
      doc.homepage ||
      `https://search.maven.org/artifact/${doc.g}/${doc.a}`;

    return {
      name: dependency.name,
      version: dependency.version ?? doc.latestVersion ?? null,
      docUrl,
      source: "online-registry"
    };
  } catch {
    return null;
  }
}
import {Dependency, DocResult} from "../../models"

type MavenCoordinates={
  groupId: string
  artifactId: string
}

export async function onlineMavenResolver(
  dependency: Dependency
): Promise<DocResult|null>{
  const coordinates= parseMavenCoordinates(dependency.name)

  if (!coordinates){
    return null
  }

  const docUrl= buildMavenCentralUrl(
    coordinates,
    dependency.version
  )

  return{
    name: dependency.name,
    version: dependency.version,
    docUrl,
    source: "online-registry"
  }
}

function parseMavenCoordinates(
  name: string
): MavenCoordinates|null{
  const [groupId, artifactId]= name
    .split(":")
    .map((part)=>part.trim())

  if (!groupId||!artifactId){
    return null
  }

  return{
    groupId,
    artifactId
  }
}

function buildMavenCentralUrl(
  coordinates: MavenCoordinates,
  version: string | null
): string {
  const artifactUrl=`https://central.sonatype.com/artifact/`+`${encodeURIComponent(coordinates.groupId)}/`+`${encodeURIComponent(coordinates.artifactId)}`

  return version? `${artifactUrl}/${encodeURIComponent(version)}`:artifactUrl
}
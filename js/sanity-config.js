export const sanityConfig = {
  projectId: 'ap45bjk4',
  dataset: 'production',
  apiVersion: '2024-01-01',
}

const remoteQueryUrl = () => {
  const {projectId, dataset, apiVersion} = sanityConfig
  return `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
}

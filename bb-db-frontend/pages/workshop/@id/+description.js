export default function description(pageContext) {
  const map = pageContext.data?.map
  return map ? map.description.length > 256 ? map.description.slice(1, 256) + '...' : map.description : 'No description'
}

export default function description(pageContext) {
  const collection = pageContext.data?.collection
  return collection ? collection.description.length > 256 ? collection.description.slice(0, 256) + '...' : collection.description : 'No description'
}

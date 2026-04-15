export default function title(pageContext) {
  const collection = pageContext.data?.collection
  return collection ? `BBDB - ${collection.title}` : 'BETON BRUTAL Database'
}

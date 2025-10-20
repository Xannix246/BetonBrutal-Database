export default function title(pageContext) {
  const map = pageContext.data?.map
  return map ? `BBDB - ${map.title}` : 'BETON BRUTAL Database'
}

export default function title(pageContext) {
  const user = pageContext.data?.user
  return user ? `BBDB - ${user.name}` : 'BETON BRUTAL Database'
}

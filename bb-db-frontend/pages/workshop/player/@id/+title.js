export default function title(pageContext) {
  const player = pageContext.data?.player
  return player ? `BBDB - ${player.username}` : 'BETON BRUTAL Database'
}

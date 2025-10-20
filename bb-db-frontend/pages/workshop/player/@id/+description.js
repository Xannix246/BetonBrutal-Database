export default function description(pageContext) {
  const player = pageContext.data?.player
  return player ? `${player.username}'s page` : 'Player not found'
}

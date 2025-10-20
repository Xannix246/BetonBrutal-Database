export default function description(pageContext) {
  const user = pageContext.data?.user
  return user ? `${user.name}'s favorites` : 'User not found'
}

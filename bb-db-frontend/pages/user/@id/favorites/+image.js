import icon from '../../../../assets/icons/favicon.png'

export default function image(pageContext) {
  const user = pageContext.data?.user
  return user.image || icon
}

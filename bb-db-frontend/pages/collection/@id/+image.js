import icon from '../../../assets/icons/favicon.png'

export default function image(pageContext) {
  const item = pageContext.data?.item
  return item ? item.previewUrl : icon
}

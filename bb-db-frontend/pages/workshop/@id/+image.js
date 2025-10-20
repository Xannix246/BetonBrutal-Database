import icon from '../../../assets/icons/favicon.png'

export default function image(pageContext) {
  const map = pageContext.data?.map
  return map ? map.previewUrl : icon
}

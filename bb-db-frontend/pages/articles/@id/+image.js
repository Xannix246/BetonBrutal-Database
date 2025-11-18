import icon from '../../../assets/icons/favicon.png'

export default function image(pageContext) {
  const article = pageContext.data?.article;
  return article?.previewUrl ? article.previewUrl : icon;
}

export default function title(pageContext) {
  const article = pageContext.data?.article;
  return article ? `BBDB - ${article.title}` : 'BETON BRUTAL Database';
}

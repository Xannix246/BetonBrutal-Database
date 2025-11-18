export default function description(pageContext) {
  const article = pageContext.data?.article;

  const description = article.description?.length > 0 ? article.description : article.content.slice(0, 255) + '...';

  return description;
}

export { data };
import { PageContext } from 'vike/types';
import { getArticle } from '../../../src/pages/Articles/requests';
// import { getMap } from '../../../src/pages/WorkshopItem/requests';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const article = await getArticle(id);
  return { id, article };
}
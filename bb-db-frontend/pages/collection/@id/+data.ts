export { data };
import { PageContext } from 'vike/types';
import { getCollection, getItem } from '../../../src/pages/Collection/requests';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const collection = await getCollection(id);
  const item = await getItem(id);

  return { id, collection, item };
}
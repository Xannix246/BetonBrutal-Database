export { data };
import { PageContext } from 'vike/types';
import { getMap } from '../../../src/pages/WorkshopItem/requests';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const map = await getMap(id);
  return { id, map };
}
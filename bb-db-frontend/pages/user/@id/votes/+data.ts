export { data };
import { PageContext } from 'vike/types';
import { getUser } from '../../../../src/pages/Favorites/requests';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const user = await getUser(id);

  return { id, user };
}
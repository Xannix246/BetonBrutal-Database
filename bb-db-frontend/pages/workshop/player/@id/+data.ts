export { data };
import { PageContext } from 'vike/types';
import { getPlayer } from '../../../../src/pages/Player/requests';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const player = await getPlayer(id);

  return { id, player };
}
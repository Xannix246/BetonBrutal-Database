export { data };
import { PageContext } from 'vike/types';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  return id;
}
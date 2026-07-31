export { data };
import { PageContext } from 'vike/types';

async function data(pageContext: PageContext) {
  const { redirect } = pageContext.urlParsed.search;
  return { redirect };
}
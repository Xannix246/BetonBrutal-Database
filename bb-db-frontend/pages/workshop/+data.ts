export { data };
import { PageContext } from 'vike/types';

async function data(pageContext: PageContext) {
  const { tags } = pageContext.urlParsed.searchAll;
  return { tags };
}
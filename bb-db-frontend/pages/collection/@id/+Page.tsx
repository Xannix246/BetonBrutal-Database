import { useData } from 'vike-react/useData';
import Collection from '../../../src/pages/Collection/Collection';

function Page() {
  const { id } = useData<{ id: string, collection: Collection}>();

  return <Collection id={id}/>;
}

export { Page };

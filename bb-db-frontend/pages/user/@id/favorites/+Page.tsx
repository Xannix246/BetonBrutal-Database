import { useData } from 'vike-react/useData';
import Favorites from '../../../../src/pages/Favorites/Favorites';

function Page() {
  const data = useData<string>();

  return <Favorites id={data}/>;
}

export { Page };

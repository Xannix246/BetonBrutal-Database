import { useData } from 'vike-react/useData';
import Favorites from '../../../../src/pages/Favorites/Favorites';

function Page() {
  const { id } = useData<{ id: string, user: User }>();

  return <Favorites id={id}/>;
}

export { Page };

import { useData } from 'vike-react/useData';
import VotesPage from '../../../../src/pages/Player/Votes';

function Page() {
  const { id } = useData<{ id: string, user: User }>();

  return <VotesPage id={id}/>;
}

export { Page };

import { useData } from 'vike-react/useData';
import PlayerPage from '../../../../src/pages/Player/Player';

function Page() {
  const { id } = useData<{ id: string, player: Player }>();

  return <PlayerPage id={id}/>;
}

export { Page };

import { useData } from 'vike-react/useData';
import PlayerPage from '../../../../src/pages/Player/Player';

function Page() {
  const data = useData<string>();

  return <PlayerPage id={data}/>;
}

export { Page };

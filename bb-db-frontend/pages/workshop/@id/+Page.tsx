import { useData } from 'vike-react/useData';
import WorkshopItemPage from "../../../src/pages/WorkshopItem/WorkshopItem";

function Page() {
  const data = useData<string>();

  return <WorkshopItemPage id={data}/>;
}

export { Page };

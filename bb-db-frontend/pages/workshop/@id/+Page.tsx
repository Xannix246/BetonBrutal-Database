import { useData } from 'vike-react/useData';
import WorkshopItemPage from "../../../src/pages/WorkshopItem/WorkshopItem";

function Page() {
  const { id } = useData<{ id: string, map: WorkshopItem}>();

  return <WorkshopItemPage id={id}/>;
}

export { Page };

import { useData } from "vike-react/useData";
import CollectionEditor from "../../../../src/pages/Collection/Editor";

function Page() {
  const { id } = useData<{ id: string, collection: Collection}>();

  return <CollectionEditor id={id} />;
}

export { Page };

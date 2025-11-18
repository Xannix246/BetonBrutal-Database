import { useData } from "vike-react/useData";
import Article from "../../../src/pages/Articles/Article";

function Page() {
  const { id } = useData<{ id: string }>();
  
  return <Article id={id}/>;
}

export { Page };

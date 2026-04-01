import { useData } from "vike-react/useData";
import Workshop from "../../src/pages/Workshop/Workshop";

function Page() {
  const { tags } = useData<{ tags: string[] }>();

  return <Workshop tags={tags} />;
}

export { Page };

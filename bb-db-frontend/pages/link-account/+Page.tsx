import { GetToken } from "@/pages";
import { useData } from "vike-react/useData";

function Page() {
  const { redirect } = useData<{ redirect: string }>();

  return <GetToken callbackUrl={redirect} />;
}

export { Page };

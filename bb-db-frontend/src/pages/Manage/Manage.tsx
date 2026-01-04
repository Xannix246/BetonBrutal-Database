import { useEffect } from "react";
import { navigate } from "vike/client/router";
import Background from "../../widgets/Background/Background";
import { authClient } from "../../features/Auth";
import LeftBar from "./LeftBar";

const Manage = () => {
  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;

      if (!["writer", "admin"].includes(user?.role as string)) {
        return navigate("/");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen min-w-screen">
      <Background />
      <LeftBar />
    </div>
  );
};

export default Manage;

import { t } from "i18next";
import { Container } from "@shared";
import { Footer, Header, Background } from "@widgets";
import { Keys } from "@locales/keys";
import { useEffect, useState } from "react";
import { sendKey } from "./requests";
import { navigate } from "vike/client/router";

const key = Keys.search;

const GetToken = ({ callbackUrl }: { callbackUrl: string }) => {
  const [loading, setLoading] = useState(true);
  const [isSuccessfull, setIsSuccessfull] = useState(false);

  useEffect(() => {
    (async () => {
      if (!callbackUrl) await navigate('/');

      const isSent = await sendKey(callbackUrl);
      setIsSuccessfull(isSent);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col h-full justify-between">
        <div className="flex gap-2 pt-32 min-h-screen w-full">
          <div className="flex flex-col gap-2 w-full text-gray-300">
            <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
              <div className="flex gap-3 uppercase">
                {loading && <span>Authorizing, please wait a bit...</span>}
                {!loading && (isSuccessfull ? (
                  <span className="text-green">
                    Authorization successful, now you can close this page.
                  </span>
                ) : (
                  <span className="text-red">
                    Authorization failed, please try again.
                  </span>
                ))}
              </div>
            </Container>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default GetToken;

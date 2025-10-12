import { usePageContext } from "vike-react/usePageContext";
import Header from "../../src/widgets/Header/Header";
import Container from "../../src/shared/Containter/Container";

export default function Page() {
  const { is404 } = usePageContext();
  if (is404) {
    return (
      <>
        <div className="w-full min-h-screen h-full bg-[url(/assets/img/bg.jpg)] bg-center bg-fixed bg-no-repeat bg-cover bg-black">
          <div className="fixed left-0 w-full z-50">
            <Header />
          </div>

          <div className="flex flex-col h-full justify-between">
            <div className="flex gap-2 pt-32 px-4 h-screen w-full">
              <div className="w-full text-white text-center">
                <Container className="text-6xl w-full">
                  Page Not Found
                </Container>
                <Container className="text-4xl w-full text-gray-300">
                  This page could not be found.
                </Container>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="w-full min-h-screen h-full bg-[url(/assets/img/bg.jpg)] bg-center bg-fixed bg-no-repeat bg-cover bg-black">
        <div className="fixed left-0 w-full z-50">
          <Header />
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full">
                Internal Error
              </Container>
              <Container className="text-4xl w-full text-gray-300">
                Something went wrong.
              </Container>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

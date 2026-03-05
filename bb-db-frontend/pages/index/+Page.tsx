import Main from "../../src/pages/Main/Main";
import Container from "../../src/shared/Containter/Container";
import Background from "../../src/widgets/Background/Background";
import Header from "../../src/widgets/Header/Header";

export default function Page() {
  return (
    // <Main/>
    <>
      <div className="w-full min-h-screen h-full bg-[url(/assets/img/bg.jpg)] bg-center bg-fixed bg-no-repeat bg-cover bg-black">
        <Background />
        <div className="fixed left-0 w-full z-50">
          <Header />
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full">The site is undergoing maintenance</Container>
              <Container className="text-4xl w-full text-gray-300">
                Sorry for the inconvenience.
              </Container>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

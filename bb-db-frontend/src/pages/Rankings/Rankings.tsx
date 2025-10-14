import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import Background from "../../widgets/Background/Background";

const Rankings = () => {
  return (
    <div className="w-full min-h-screen h-full">
      <Background/>
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        <div className="flex gap-2 pt-32 px-4 h-screen w-full">
          <div className="w-full text-white text-center">
            <Container className="text-6xl w-full">
              Under Construction...
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rankings;

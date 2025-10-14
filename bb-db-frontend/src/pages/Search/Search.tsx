import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import MapTile from "../../entities/MapTile";
import { getSearchData } from "../../store/store";
import { useEffect } from "react";
import Background from "../../widgets/Background/Background";

const Search = () => {
  const searchData = getSearchData();

  useEffect(() => {
    console.log(searchData);
  }, []);

  return (
    <div className="w-full min-h-screen h-full">
      <Background/>
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col h-full justify-between">
        <div className="flex gap-2 pt-32 min-h-screen w-full">
          <div className="flex flex-col gap-2 w-full text-gray-300">
            <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
              <div className="flex gap-3">
                <span>SEARCH RESULTS</span>
              </div>
            </Container>
            <div className="px-4">
              {searchData.length > 0 ?
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[300px] gap-6 p-6 w-full">
                  {searchData.map(m => (
                    <MapTile key={m.id} {...m} />
                  ))}
                </div>
                :
                <div className="flex w-full">
                  <Container className="flex flex-col w-full justify-center gap-10 text-4xl tracking-wide place-items-center">
                    <span className="text-6xl text-red">FOUND NOTHING</span>
                    <span className="text-gray-300 text-2xl">Maybe try to search something else?</span>
                  </Container>
                </div>
              }
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Search;

import Container from "../Containter/Container";

type Props<T> = {
  data: T[];
  displayData: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
};

const List = <T,>({ data, displayData, onItemClick }: Props<T>) => {
  return (
    <div className="relative w-full">
      <div className="absolute flex flex-col h-100 overflow-auto w-full z-10">
        {data.map((item, index) => (
          <Container
            className="hover:bg-[#474747] transition text-white uppercase text-xl cursor-pointer"
            key={index}
            onClick={() => onItemClick?.(item)}
          >
            {displayData(item)}
          </Container>
        ))}
      </div>
    </div>
  );
};

export default List;

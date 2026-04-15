import clsx from "clsx";
import Container from "../Containter/Container";

type Props<T> = {
  data: T[];
  displayData: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  className?: string;
  containerClassName?: string;
};

const List = <T,>({ data, displayData, onItemClick, className, containerClassName }: Props<T>) => {
  return (
    <div className={clsx(containerClassName, "relative w-full z-20")}>
      <div className={clsx(className, "absolute flex flex-col h-100 overflow-auto w-full z-10")}>
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

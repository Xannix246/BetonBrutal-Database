import clsx from "clsx";
import Container from "../Containter/Container";
import { isClassic } from "@/utils";

type Props<T> = {
  data: T[];
  displayData: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  className?: string;
  containerClassName?: string;
};

const List = <T,>({ data, displayData, onItemClick, className, containerClassName }: Props<T>) => {
  return (
    <div className={clsx(containerClassName, "relative w-full z-20", isClassic() && "border-l-2 border-classic-blue-200")}>
      <div className={clsx(className, 
        isClassic()
          ? "border-1 border-l-4 border-classic-blue-300 max-h-[90vh] overflow-hidden drop-shadow-[3px_3px_1px_rgba(0,0,0,0.25)]"
          : "absolute flex flex-col h-100 overflow-auto w-full z-10"
      )}>
        {data.map((item, index) => (
          <Container
            className={clsx(
              isClassic()
                ? "hover:bg-classic-blue-400 hover:text-white p-1 hover:underline cursor-pointer"
                : "hover:bg-[#303030]/80 hover:text-pink transition duration-150 text-white uppercase text-xl cursor-pointer"
            )}
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

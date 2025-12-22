import { useEffect, useState } from "react";

type Props = {
  id: string;
  title: string;
  preview: string;
  previews?: string[];
}

function randomPreview(length: number) {
  return Math.floor(Math.random() * length);
}

const MapCard = ({ id, title, preview, previews}: Props) => {
  const [previewId, setPreviewId] = useState(0);

  useEffect(() => {
    if (previews) setPreviewId(randomPreview(previews.length));
  }, []);

  return (
    <a
      className="group bg-black/70 w-full h-156 lg:w-[28%] lg:h-232 lg:hover:w-[30%] transform duration-300 relative flex overflow-hidden cursor-pointer"
      href={`/workshop/${id}`}
    >
      <img
        src={previews && previews.length > 0 ? previews[previewId] : preview}
        alt={title}
        className="absolute h-full w-full object-cover transform duration-500 group-hover:scale-102"
      />
      <div className="w-full h-full flex place-items-center relative z-10">
        <span
          className="flex min-h-36 w-full justify-center place-items-center p-4 bg-black/70 text-[#f1e4c7] text-5xl text-center whitespace-pre-line"
        >
          {title?.toUpperCase().replaceAll(" ", "\n")}
        </span>
      </div>
    </a>
  );
}

export default MapCard;

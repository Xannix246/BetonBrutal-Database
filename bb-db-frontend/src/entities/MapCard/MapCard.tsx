import { useEffect, useState } from "react";
import { isClassic } from "@utils";

type Props = {
  id: string;
  title: string;
  preview: string;
  previews?: string[];
  description?: string;
};

function randomPreview(length: number) {
  return Math.floor(Math.random() * length);
}

const MapCard = ({ id, title, preview, previews, description }: Props) => {
  const [previewId, setPreviewId] = useState(0);

  useEffect(() => {
    if (previews) setPreviewId(randomPreview(previews.length));
  }, []);

  return !isClassic() ? (
    <a
      className="group bg-black/70 w-full lg:w-[28%] lg:hover:w-[30%] transform duration-300 min-h-156 relative flex overflow-hidden cursor-pointer"
      href={`/workshop/${id}`}
    >
      <img
        src={previews && previews.length > 1 ? previews[previewId] : preview}
        alt={title}
        className="absolute h-full w-full object-cover transform duration-500 group-hover:scale-102"
      />
      <div className="w-full h-full flex place-items-center relative z-10">
        <span className="flex min-h-36 w-full justify-center place-items-center p-4 bg-black/70 text-[#f1e4c7] text-5xl text-center whitespace-pre-line">
          {title?.toUpperCase().replaceAll(" ", "\n")}
        </span>
      </div>
    </a>
  ) : (
    <div className="w-full flex container-yellow p-2" key={id}>
      <div className="relative w-fit h-fit">
        <img
          src={preview}
          alt={title}
          className="min-w-48 w-48 object-cover aspect-square border-1 border-classic-blue-300"
        />
        <img className="absolute w-16 -right-4 -bottom-4" src="/assets/icons/anniv-icons/WindowsMessenger.png"/>
      </div>
      <div className="flex flex-col ml-8">
        <span className="text-classic-blue-500 font-bold text-2xl">{title}</span>
        <span className="m-2">{description ?? "No description"}</span>
        <div className="flex gap-2 place-items-center group">
          <img className="w-6 group-hover:brightness-120" src="/assets/icons/anniv-icons/Go.png"/>
          <a className="text-classic-blue-500 hover:underline" href={`/workshop/${id}`}>Go to workshop item</a>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {previews?.map((preview) => (
            <a href={preview} target="_blank" className="w-48 mt-8">
              <img
                src={preview}
                alt={title}
                className="w-48 object-cover border-1 border-classic-blue-300"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapCard;

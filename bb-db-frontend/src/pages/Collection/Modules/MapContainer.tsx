import { useEffect, useRef, useState } from "react";
import { handleSearch } from "../../../features/SearchManager";
import Input from "../../../shared/Input/Input";
import List from "../../../shared/List/List";
import clsx from "clsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Textarea from "../../../shared/Textarea/Textarea";
import Button from "../../../shared/Button/Button";
import { Keys } from "../../../../i18n/keys";
import { t } from "i18next";

type MapContainer = {
  maps: WorkshopItemHeader[];
  title: string;
  description: string;
  preview?: File | string;
  setMaps: (maps: WorkshopItemHeader[]) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPreview: (file: File | string) => void;
}

const key = Keys.collection.editor;

const MapContainer = ({ maps, title, description, preview, setMaps, setTitle, setDescription, setPreview }: MapContainer) => {
  const [foundMaps, setFoundMaps] = useState<WorkshopItemHeader[]>([]);
  const [search, setSearch] = useState("");
  const [descWindow, descWindowOpen] = useState(false);;
  const imageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFoundMaps([]);

    const timer = setTimeout(async () => {
      if (!search.trim()) {
        return;
      }

      const data = await handleSearch(search, true);
      if (data) setFoundMaps(data);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const onItemClick = (item: WorkshopItemHeader) => {
    const mapsIds = maps.map((map) => map.id);

    if (mapsIds.includes(item.id)) return;

    setMaps([...maps, item]);
    setSearch("");
    setFoundMaps([]);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    setPreview(event.target.files[0]);
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="place-items-center">
        <h1 className="tracking-wider text-6xl text-white uppercase pb-2">
          {t(key.newCollection)}
        </h1>
        <div className="flex flex-col gap-4 w-full">
          <Input
            className="text-2xl w-full bg-black/60"
            placeholder={t(key.title)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div
            className={clsx(
              "flex flex-col w-full bg-black/80 transition-[height] duration-300 relative",
              descWindow ? "h-64" : "h-12",
            )}
          >
            <div
              className="flex h-fit"
              onClick={() => descWindowOpen(!descWindow)}
            >
              <ChevronRightIcon
                width={40}
                className={clsx(
                  "text-white transform duration-300",
                  descWindow ? "rotate-90" : "rotate-0",
                )}
              />
              <h2 className="text-2xl tracking-wider text-white p-2 select-none uppercase">
                {t(key.desc)}
              </h2>
            </div>

            <Textarea
              placeholder={t(key.descPh)}
              className={clsx(
                "text-xl text-gray-300 bg-transparent transition-all duration-300 pl-1 pr-2",
                descWindow ? "opacity-100 h-full pb-2" : "opacity-0 h-0 pb-0",
              )}
              onChange={(e) => {
                const eValue = e.target.value.slice(0, 1024);
                if (description.length < 1024 || description.length > eValue.length) setDescription(eValue);
              }}
              value={description}
            />

            <h5 className={clsx(
              "absolute bottom-0 right-0 px-8 pb-2 transition-all duration-300 text-shadow-xs",
              descWindow ? "opacity-100" : "opacity-0",
              description.length < 1024 ? "text-white" :"text-red"
            )}>{description.length}/1024</h5>
          </div>
          <div className="flex gap-2">
            <Input
              className="text-3xl w-full bg-black/60"
              placeholder={t(key.previewPh)}
              value={preview as string}
              onChange={(e) => setPreview(e.target.value)}
            />
            <Button
              className="uppercase p-2 whitespace-nowrap bg-black/80"
              onClick={() => {
                imageRef.current?.click();
              }}
            >{t(key.upload)}</Button>
          </div>
          <Input
            className="text-2xl w-full bg-black/80"
            placeholder={t(key.searchPh)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".jpg,.jpeg,.png,.webp,.gif"
            multiple={false}
            ref={imageRef}
          />
        </div>
        {foundMaps.length > 0 && (
          <List
            data={foundMaps}
            displayData={(map) => map.title}
            onItemClick={onItemClick}
          />
        )}
      </div>
    </div>
  );
};

export default MapContainer;

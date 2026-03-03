import { useEffect, useRef, useState } from "react";
import Input from "../../../shared/Input/Input";
import { getActiveMap, setActiveMap } from "../../../store/store";
import Button from "../../../shared/Button/Button";
import Textarea from "../../../shared/Textarea/Textarea";
import { createMap, updateMap, uploadImage } from "../requests";
import { DeleteMap } from "../../../features/DataManager";

const UpsertMapContainer = ({createNewMap = false}: { createNewMap?: boolean }) => {
  const activeMap = getActiveMap();
  const [newMap, isNewMap] = useState(createNewMap);
  const [steamId, setSteamId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [creator, setCreator] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [preview, setPreview] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const previewRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeMap) {
      if(!createNewMap) {
        isNewMap(false);
      }
      setTitle(activeMap.title);
      setDesc(activeMap.description || "");
      setCreator(activeMap.creator);
      setPreview(activeMap.previewUrl);
      setPreviews(activeMap.previews);
    }
  }, [activeMap]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const url = await uploadImage(event.target.files[0]);
    setPreview(url);
    event.target.value = "";
  };

  const handleUpdate = async () => {
    if (!activeMap) return;

    await updateMap(activeMap.steamId, {
      title,
      description: desc,
      previewUrl: preview,
      creator,
      previews,
    });
  };

  const onCreate = () => {
    isNewMap(true);
    setTitle("");
    setDesc("");
    setCreator("");
    setPreview("");
    setPreviews([]);
  }

  const onCancelCreate = () => {
    if (activeMap) {
      isNewMap(false);
      setTitle(activeMap.title);
      setDesc(activeMap.description || "");
      setCreator(activeMap.creator);
      setPreview(activeMap.previewUrl);
      setPreviews(activeMap.previews);
    }
  }

  const handleDelete = async () => {
    if (!activeMap) return;

    await DeleteMap(activeMap.steamId);
    setActiveMap(null);
  };

  const handleCreate = async () => {
    if (!activeMap) return;

    isNewMap(false);

    const map = await createMap({
      steamId,
      creator,
      creatorId,
      title,
      description: desc,
      previews,
      previewUrl: preview,
    });

    setActiveMap(map);
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        className="text-2xl w-full bg-black/60"
        placeholder="Title (required)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {newMap && <Input
        className="text-2xl w-full bg-black/60"
        placeholder="Steam id (required)"
        value={steamId}
        onChange={(e) => setSteamId(e.target.value)}
      />}
      <Input
        className="text-2xl w-full bg-black/60"
        placeholder="Creator nickname"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      {newMap && <Input
        className="text-2xl w-full bg-black/60"
        placeholder="Creator id (required)"
        value={creatorId}
        onChange={(e) => setCreatorId(e.target.value)}
      />}
      <Input
        className="text-2xl w-full bg-black/60"
        placeholder="Preview Url"
        value={preview}
        onChange={(e) => setPreview(e.target.value)}
      />
      <div className="flex gap-2 h-64 w-full">
        <div className="size-64 relative group">
          <img src={preview} className="min-w-64 min-h-64 bg-blue" />
          <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-xs duration-300 flex justify-center place-items-center">
            <Button className="uppercase h-fit" onClick={() => previewRef.current?.click()}>Upload preview</Button>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            ref={previewRef}
          />
        </div>

        <Textarea
          className="text-2xl w-full h-full pl-2 text-white"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div>
        <h2 className="tracking-wider text-4xl text-white uppercase mb-2">
          Previews:
        </h2>
        <div className="flex flex-col gap-2 text-white">
          {previews.map((preview, i) => (
            <h3 key={i} className="bg-black/60 p-3 text-2xl">
              {preview}
            </h3>
          ))}

          <Input
            className="text-2xl w-full bg-black/60"
            placeholder="Add Url (Work in progress)"
            disabled={true}
          />
        </div>
      </div>

      {!newMap ? <div className="flex gap-2 w-full">
        <Button className="uppercase w-full text-white hover:bg-yellow/50" onClick={handleUpdate}>Update map</Button>
        <Button className="uppercase w-full text-white hover:bg-red/50" onClick={handleDelete}>Delete map</Button>
        <Button className="uppercase w-full text-white hover:bg-green/50" onClick={onCreate}>Create new</Button>
      </div> : <div className="flex gap-2 w-full">
          <Button className="uppercase w-full text-white hover:bg-red/50" onClick={onCancelCreate}>Cancel</Button>
          <Button 
            className="uppercase w-full text-white hover:bg-green/50 disabled:hover:bg-black/70"
            disabled={!steamId || !creatorId || !title}
            onClick={handleCreate}
          >Upload map</Button>
      </div>}
    </div>
  );
};

export default UpsertMapContainer;

import { useEffect, useState } from "react";
import Background from "../../widgets/Background/Background";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import MapContainer from "./Modules/MapContainer";
import MapTile from "../../entities/MapTile";
import { v4 } from "uuid";
import ContextMenu from "../../shared/ContextMenu/ContextMenu";
import { getTargetData, getUser, setTargetData } from "../../store/store";
import SidePanel from "./Modules/SidePanel";
import Container from "../../shared/Containter/Container";
import Button from "../../shared/Button/Button";
import { signIn } from "../../features/Auth";
import { getCollection, getItem, getItemData, postCollection, uploadPreview } from "./requests";
import { navigate } from "vike/client/router";

const CollectionEditor = ({ id }: { id?: string }) => {
  const [maps, setMaps] = useState<WorkshopItem[]>([]);
  const [openCMenu, setOpenCMenu] = useState(false);
  const targetData = getTargetData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<File | string>("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isMain, setIsMain] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const user = getUser();

  const menuItems = [
    {
      name: "Remove item",
      onClick: () => {
        if (!targetData) return;

        const updatedMaps = [...maps.filter((map) => map.id !== targetData.id)];
        setMaps(updatedMaps);
      },
    },
  ];

  useEffect(() => {
    if (targetData) {
      setOpenCMenu(true);
    }
  }, [targetData]);

  const onPublish = async () => {
    if (!title || maps.length === 0) return;

    const publishedCollection = await postCollection(
      {
        title,
        description,
        descColor: "black",
        isPublic: !isPrivate,
        showOnMain: isMain,
        previewUrl: typeof preview === "string" ? preview : undefined,
        mapsId: maps.map((map) => map.steamId || map.id),
      },
      id,
    );

    if (!(typeof preview === "string")) {
      await uploadPreview(preview, publishedCollection.id);
    }

    await navigate(`/collection/${publishedCollection.id}`);
  }

  useEffect(() => {
    (async () => {
      if (id) {
        const collection = await getCollection(id);

        if (
          user?.role && 
          (collection.authorId === user?.id ||
          ["moderator", "admin"].includes(user.role))
        ) {
          const item = await getItem(id);
          const maps = await getItemData(collection.mapsId);

          setTitle(collection.title);
          setDescription(collection.description || "");
          setPreview(item.previewUrl);
          setMaps(maps);
          setIsPrivate(!collection.isPublic);
          setIsMain(collection.showOnMain);
        } else {
          return window.location.href = `/collection/${id}`;
        }
      }

      setHydrated(window && true);
    })();
  }, []);

  if (!hydrated) return;

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <ContextMenu
        menu={menuItems}
        open={openCMenu}
        setOpen={setOpenCMenu}
        onClose={() => setTargetData(null)}
      />

      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="h-full justify-between">
        {user ? <div className="flex gap-6 pt-32 p-6 min-h-screen h-full w-full">
          <div className="sticky h-[calc(100vh-72px)] top-17">
            <SidePanel
              isPrivate={isPrivate} setIsPrivate={setIsPrivate}
              isMain={isMain} setIsMain={setIsMain}
              preview={preview}
              onPublish={onPublish}
              id={id}
            />
          </div>

          <div className="flex flex-col place-items-center w-full gap-6">
            <MapContainer
              maps={maps} setMaps={setMaps}
              title={title} setTitle={setTitle}
              description={description} setDescription={setDescription}
              preview={preview} setPreview={setPreview}
            />

            <div className="flex gap-2 w-full">
              <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 w-full">
                {maps.map((m) => (
                  <MapTile key={`${v4()}`} {...m} />
                ))}
              </div>
            </div>
          </div>
        </div> 
        :
        <div className="min-h-screen">
          <div className="flex flex-col h-full justify-between">
             <div className="flex gap-2 pt-32 px-4 h-screen w-full">
               <div className="flex flex-col w-full text-white text-center place-items-center">
                 <Container className="text-6xl w-full">Account required</Container>
                 <Container className="text-4xl w-full text-gray-300">
                   If you want to create your own collection, please log in
                 </Container>
                 <Button
                    className="bg-green/50 uppercase p-2 w-128 mt-8"
                    onClick={() => signIn(window.location.pathname)}
                  >Log in</Button>
               </div>
             </div>
           </div>
        </div>}

        <Footer />
      </div>
    </div>
  );
};

export default CollectionEditor;

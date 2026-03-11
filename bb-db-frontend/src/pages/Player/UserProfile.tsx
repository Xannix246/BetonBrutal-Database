import { useEffect, useRef, useState } from "react";
import { getUserPublicData, setUserPublicData, uploadImage } from "./requests";
import clsx from "clsx";
import Container from "../../shared/Containter/Container";
import Input from "../../shared/Input/Input";
import Button from "../../shared/Button/Button";
import { getUser } from "../../store/store";
import Textarea from "../../shared/Textarea/Textarea";
import { t } from "i18next";
import { Keys } from "../../../i18n/keys";

type Props = {
  user: User;
  player: Player;
  publicData: PublicData | undefined;
  setPublicData: (data: PublicData | undefined) => void;
};

const key = Keys.player;

const UserProfile = ({ user, player, publicData, setPublicData }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [about, setAbout] = useState("");
  const [links, setLinks] = useState<Link[]>([]);
  const [nameInputValue, setNameInputValue] = useState("");
  const [urlInputValue, setUrlInputValue] = useState("");
  const currentUser = getUser();
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [type, setType] = useState<"bg" | "pfp">("bg");

  useEffect(() => {
    (async () => {
      const publicData = await getUserPublicData(user.id);
      setPublicData(publicData);

      setProfilePicUrl(publicData.profilePicUrl || "");
      setBackgroundUrl(publicData.backgroundUrl || "");
      setAbout(publicData.about || "");
      setLinks(publicData.links || []);
    })();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const url = await uploadImage(event.target.files[0], type);
    if (type === "bg") {
      setBackgroundUrl(url);
      setPublicData({ ...publicData, backgroundUrl: url });
    } else {
      setProfilePicUrl(url);
      setPublicData({ ...publicData, profilePicUrl: url });
    }
    
    event.target.value = "";
  };

  const onAddingLink = () => {
    const urlRegex = /[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)/gi;

    if (!nameInputValue || !urlInputValue || !urlInputValue.match(urlRegex)) {
      return;
    }

    if (links.length >= 5) {
      return;
    }

    setLinks([...links, { showName: nameInputValue, url: urlInputValue }]);
    setNameInputValue("");
    setUrlInputValue("");
  };

  const onCancel = () => {
    if (publicData) {
      setProfilePicUrl(publicData.profilePicUrl || "");
      setBackgroundUrl(publicData.backgroundUrl || "");
      setAbout(publicData.about || "");
      setLinks(publicData.links || []);
    }

    setEditMode(false);
  }

  const onSave = async () => {
    const updatedData = await setUserPublicData({
      profilePicUrl,
      backgroundUrl,
      links,
      about,
    });

    setPublicData(updatedData);
    setEditMode(false);
  }

  return (
    <div className="w-full h-full flex-col-reverse flex md:flex-row gap-2 px-2">
      {publicData?.profilePicUrl && (
        <img
          src={profilePicUrl}
          className={clsx("aspect-square md:min-w-128 md:h-128 object-cover")}
          alt="profile picture"
        />
      )}

      <div className="flex flex-col w-full gap-2">
        <Container className="flex uppercase tracking-wider text-4xl text-white justify-center">
          <a
            href={`https://steamcommunity.com/profiles/${player?.id}`}
            className="cursor-pointer hover:underline"
          >{t(key.title, { user: user.name,  steamName: player.username })}</a>
        </Container>
        {editMode && (
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".jpg,.jpeg,.png,.webp,.gif"
            multiple={false}
            ref={imageRef}
          />
        )}
        {editMode && (
          <div className="flex gap-2">
            <Input
              className="text-3xl w-full"
              placeholder={t(key.pfpPlaceholder)}
              value={profilePicUrl}
              onChange={(e) => setProfilePicUrl(e.target.value)}
            />
            <Button
              className="uppercase p-2 whitespace-nowrap"
              onClick={() => {
                setType("pfp");
                imageRef.current?.click();
              }}
            >{t(key.upload)}</Button>
          </div>
        )}
        {editMode && (
          <div className="flex gap-2">
            <Input
              className="text-3xl w-full"
              placeholder={t(key.bgPlaceholder)}
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
            />
            <Button
              className="uppercase p-2 whitespace-nowrap"
              onClick={() => {
                setType("bg");
                imageRef.current?.click();
              }}
            >{t(key.upload)}</Button>
          </div>
        )}
        {editMode ? (
          <Textarea
            className="text-3xl min-h-64 pl-1"
            placeholder="Write something about you"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        ) : (
          <Container className="text-3xl">
            <h2 className="pl-8 pb-8">{about || t(key.noDesc)}</h2>
          </Container>
        )}
        <Container className="text-3xl">
          <h2 className="uppercase tracking-wider text-white">{t(key.links)}</h2>
        </Container>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 w-full">
            <Container className="flex gap-2 text-3xl w-full">
              <h3>{link.showName}:</h3>
              <a
                href={link.url}
                className="hover:underline hover:text-white duration-150"
              >{link.url}</a>
            </Container>
            {editMode && <Button
              className="uppercase p-2 whitespace-nowrap text-white hover:bg-red/50 place-items-center"
              onClick={() => setLinks(links.filter((l) => l.url !== link.url))}
            >{t(key.deleteUrl)}</Button>}
          </div>
        ))}
        {links.length === 0 && (
          <Container>
            <h2 className="uppercase text-3xl tracking-wider">
              {t(key.noLinks)}
            </h2>
          </Container>
        )}
        {editMode && (
          <div className="flex w-full gap-2">
            <Input
              className="text-3xl w-full"
              placeholder={t(key.linkName)}
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
            />
            <Input
              className="text-3xl w-full"
              placeholder={t(key.linkUrl)}
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
            />
            <Button
              className="uppercase p-2 whitespace-nowrap"
              onClick={onAddingLink}
            >{t(key.add)}</Button>
          </div>
        )}
        {user.id === currentUser?.id && (
          <div className="flex w-full justify-center">
            {editMode ? (
              <div className="flex gap-2 w-full">
                <Button
                  className="uppercase p-3 bg-red/50 w-full"
                  onClick={onCancel}
                >{t(key.cancel)}</Button>
                <Button
                  className="uppercase p-3 bg-green/50 w-full"
                  onClick={onSave}
                >{t(key.save)}</Button>
              </div>
            ) : (
              <Button
                className="uppercase p-3 bg-green/50 w-full md:w-md"
                onClick={() => setEditMode(true)}
              >{t(key.edit)}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

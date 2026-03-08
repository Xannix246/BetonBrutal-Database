import { useEffect, useState } from "react";
import { getUserPublicData } from "./requests";
import clsx from "clsx";
import Container from "../../shared/Containter/Container";

type Props = {
  user: User;
  player: Player;
  publicData: PublicData | undefined;
  setPublicData: (data: PublicData | undefined) => void;
};

const UserProfile = ({ user, player, publicData, setPublicData }: Props) => {
  const [editMode, setEditMode] = useState(false);
  
  useEffect(() => {
    (async () => {
      setPublicData(await getUserPublicData(user.id));
      console.log(await getUserPublicData(user.id));
    })();
  }, []);

  return (
    <div className="w-full h-full flex-col-reverse flex md:flex-row gap-2 px-2">
      {publicData?.profilePicUrl && (
        <img
          src={publicData?.profilePicUrl}
          className={clsx("aspect-square md:min-w-128 md:h-128 object-cover")}
        />
      )}

      <div className="flex flex-col w-full gap-2">
        <Container className="uppercase tracking-wider text-4xl text-white">
          <a href={`https://steamcommunity.com/profiles/${player?.id}`} className="cursor-pointer hover:underline">
            {`${user.name}'s`} ({`${player.username}`}) page
          </a>
        </Container>
        <Container className="text-3xl">
          <h2 className="pl-8 pb-8">{publicData?.about || "No description"}</h2>
        </Container>
        <Container className="text-3xl">
          <h2 className="uppercase tracking-wider text-white">Links</h2>
        </Container>
        {publicData?.links?.map((link, i) => (
          <Container key={i}>
            <h3>{link.showName}:</h3>
            <a href={link.url}>{link.url}</a>
          </Container>
        ))}
        {publicData?.links?.length === 0 && (
          <Container>
            <h2 className="uppercase text-3xl tracking-wider">
              No links attached
            </h2>
          </Container>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

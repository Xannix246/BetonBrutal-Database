import Checkbox from "../../../shared/Checkbox/Checkbox";
import Container from "../../../shared/Containter/Container";
import { getUser } from "../../../store/store";
import Button from "../../../shared/Button/Button";
import { navigate } from "vike/client/router";
import { deleteCollection } from "../requests";
import { Keys } from "../../../../i18n/keys";
import { t } from "i18next";

type SidePanel = {
  isPrivate: boolean;
  isMain: boolean;
  preview: File | string;
  setIsPrivate: (value: boolean) => void;
  setIsMain: (value: boolean) => void;
  onPublish: () => void;
  id?: string;
}

const key = Keys.collection.editor;

const SidePanel = ({ isPrivate, isMain, preview, setIsPrivate, setIsMain, onPublish, id }: SidePanel) => {
  const user = getUser();

  const onDelete = async () => {
    if (!id) return;

    await deleteCollection(id);
    await navigate("/");
  }

  return (
    <Container className="flex flex-col text-white place-items-center p-4 bg-black/60 w-[300px] h-full gap-16">
      <div className="text-5xl font-bold uppercase">{t(key.settings)}</div>

      <div className="flex flex-col justify-between h-full">
        <div className="grid gap-4">
          <div className="flex gap-4 place-items-center">
            <Checkbox enabled={isPrivate} setEnabled={setIsPrivate} />
            <h4 className="text-2xl uppercase font-bold text-center">
              {t(key.private)}
            </h4>
          </div>
          {user?.role && ["moderator", "admin"].includes(user.role) && 
            <div className="flex gap-4 place-items-center">
              <Checkbox enabled={isMain} setEnabled={setIsMain} />
              <h4 className="text-2xl uppercase font-bold text-center">
                {t(key.mainPage)}
              </h4>
            </div>
          }
        </div>
        {preview && <div className="flex flex-col place-items-center gap-4">
          <img
            className="bg-white/10 w-full h-full aspect-square object-cover"
            src={typeof preview === "string" ? preview : URL.createObjectURL(preview)}
            alt="preview"
          />
          <h4 className="text-3xl uppercase font-bold">{t(key.preview)}</h4>
        </div>}
        <div>
          <h5 className="text-gray-400 tracking-wide">{t(key.privateTip)}</h5>
        </div>
        <div className="w-full grid gap-4">
          {id && <Button
            className="bg-red/50 uppercase p-2 w-full"
            onClick={onDelete}
          >{t(key.delete)}</Button>}
          <Button
            className="bg-green/50 uppercase p-2 w-full"
            onClick={onPublish}
          >{id ? t(key.update) : t(key.publish)}</Button>
        </div>
      </div>
    </Container>
  );
};

export default SidePanel;

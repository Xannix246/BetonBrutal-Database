import { Button } from "@headlessui/react";
import Modal from "../shared/Modal/Modal"
import { api, authClient } from "./Auth";
import { config } from "../../config/config";
import { setUser } from "../store/store";

const DeleteModal = ({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) => {
  const handleDelete = async () => {
    await api.delete(`${config.serverUri}/user/me/delete`)
      .then(async () => await authClient.deleteUser())
      .catch(() => console.log("failed to delete user content"));
    setUser(undefined);
    setOpen(false);
  }

  return (
    <div className="fixed">
      <Modal open={open} onClose={() => setOpen(false)} className="p-5 md:p-10 w-3xl flex flex-col gap-5">
        <h1 className="text-2xl md:text-4xl uppercase text-center">Are you sure you want to delete your account? All user data like comments, articles and favorite list will be deleted. This action cannot be canceled.</h1>
        <div className="flex w-full justify-between">
          <Button
            className="text-2xl bg-red/80 hover:text-black hover:bg-red-500/80"
            onClick={handleDelete}
          >Delete account</Button>
          <Button
            className="text-2xl bg-white/20 hover:text-white hover:bg-green/80"
            onClick={() => setOpen(false)}
          >Well... Maybe later</Button>
        </div>
      </Modal>
    </div>
  )
}

export default DeleteModal;

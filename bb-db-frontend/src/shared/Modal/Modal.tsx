import { Dialog, DialogPanel } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  open: boolean;
}

const Modal = ({ children, className, open, onClose }: Props) => {
  return (
    <div className="inset-0">
      <Dialog open={open} onClose={() => { if (onClose) onClose() }} className="relative z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-[2px]"
        />
        <motion.div
          className="fixed inset-0 flex w-screen items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "backInOut", duration: 0.2 }}
        >
          <DialogPanel className={clsx(className, "max-w-full bg-black/70 m-4 text-white")}>
            {children}
          </DialogPanel>
        </motion.div>
      </Dialog>
    </div>
  );
}

export default Modal;
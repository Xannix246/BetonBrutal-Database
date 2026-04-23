import { AnimatePresence } from "motion/react";
import Toast from "../../entities/Toast";
import Button from "../../shared/Button/Button";
import { clearToasts, getToasts } from "../../store/toast-manager";

const Toasts = () => {
  const toasts = getToasts();

  return (
    <div className="fixed bottom-0 right-0 w-fit h-[90%] z-100 m-4">
      <div className="w-full h-full flex flex-col gap-2 justify-end place-items-end">
        <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-2 toasts">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast toast={toast} key={toast.id} />
            ))}
          </AnimatePresence>
        </div>
        <div className="flex">
          {toasts.length > 1 && (
            <Button 
              className="h-full uppercase"
              onClick={clearToasts}
            >
              Clear notifications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toasts;

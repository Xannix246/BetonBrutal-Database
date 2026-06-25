import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@shared";
import { Toast } from "@entities";
import { clearToasts, getToasts } from "@store";

const Toasts = () => {
  const toasts = getToasts();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(window && true);
  }, []);

  if (!hydrated) return;

  return (
    <div className="fixed bottom-0 right-0 w-fit max-h-[90%] z-100 m-4">
      <div className="w-full h-full flex flex-col justify-end gap-2 place-items-end">
        <div className="max-h-[80vh] flex flex-col gap-2 toasts">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast toast={toast} key={toast.id} />
            ))}
          </AnimatePresence>
        </div>
        {toasts.length > 1 && (
          <Button 
            className="h-fit uppercase"
            onClick={clearToasts}
          >
            Clear notifications
          </Button>
        )}
      </div>
    </div>
  );
};

export default Toasts;

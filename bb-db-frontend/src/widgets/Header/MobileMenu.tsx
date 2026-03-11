import clsx from "clsx";
import Button from "../../shared/Button/Button";
import { signIn } from "../../features/Auth";
import Link from "../../shared/Link/Link";
import { JSX, useEffect } from "react";
import { Keys } from "../../../i18n/keys";
import { t } from "i18next";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  user: User | undefined;
  menu: {
    name: string;
    className?: string;
    icon?: JSX.Element;
    onClick?: () => void;
  }[]
}

const key = Keys.header;

const MobileMenu = ({ open, setOpen, user, menu }: Props) => {

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [open]);

  return (
    <div
      className={clsx(
        "fixed inset-0 h-full w-full bg-black/40 backdrop-blur-xs transition duration-300",
        open ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
      )}
      onClick={() => setOpen(false)}
    >
      <div
        className={clsx(
          "bg-black/80 w-[80%] max-w-[320px] h-full p-4 flex flex-col justify-between",
          "transition-all duration-300",
          open ? "opacity-100 translate-y-0"
            : "opacity-0 translate-x-[-320px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          className="text-[#ffd884] text-4xl tracking-wider text-shadow-lg/30 text-center"
          onClick={() => setOpen(false)}
        >
          BETON BRUTAL DATABASE
        </h1>

        <div className="text-white text-shadow-lg text-4xl flex flex-col gap-10 pl-8">
          <Link className="w-fit" href="/">{t(key.home)}</Link>
          <Link className="w-fit" href="/workshop">{t(key.maps)}</Link>
          <Link className="w-fit" href="/rankings">{t(key.rankings)}</Link>
          <Link className="w-fit" href="/articles">{t(key.articles)}</Link>
        </div>

        {user ?
          <div className="flex flex-col gap-4 justify-center">
            <div className="w-full flex flex-col-reverse gap-2">
              {menu.map((item, i) => (
                <Button
                  key={i}
                  className="text-2xl p-2 w-full bg-white/10 place-items-center uppercase"
                  onClick={item.onClick}
                >{item.name}</Button>
              ))}
            </div>
            <div className="flex gap-4 place-items-center">
              <span className="text-white font-xl tracking-wider">{user.name.toUpperCase().replaceAll(" ", "\n")}</span>
              <img src={user.image || ""} alt="avatar" className="min-w-12 h-12 cursor-pointer" />
            </div>
          </div>
          :
          <Button
            className="text-2xl w-full bg-white/10 place-items-center"
            onClick={() => signIn(window.location.pathname)}
          >{t(key.login)}</Button>
        }
      </div>
    </div>
  );
}

export default MobileMenu;

import clsx from "clsx";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import Link from "../../shared/Link/Link";
import { JSX, useCallback, useEffect, useState } from "react";
import { handleEnterSearch, handleSearch } from "../../features/SearchManager";
import { logOut, signIn } from "../../features/Auth";
import Dropdown from "../../shared/Dropdown/Dropdown";
import { ArrowLeftEndOnRectangleIcon, StarIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import { navigate } from "vike/client/router";
import MobileMenu from "./MobileMenu";
import { getUser, setUser } from "../../store/store";
import DeleteModal from "../../features/DeleteModal";

const Header = ({ isAbsolute, additionalComponent, hideSearch }: { isAbsolute?: boolean, hideSearch?: boolean, additionalComponent?: JSX.Element }) => {
  const [search, setSearch] = useState("");
  const user = getUser();
  const [width, setWidth] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleWindowResize = useCallback(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const menu = [
    {
      name: "LOG OUT",
      icon: <ArrowLeftEndOnRectangleIcon width={24} />,
      onClick: () => {
        logOut();
        setUser(undefined);
      }
    },
    {
      name: "FAVORITES",
      icon: <StarIcon width={24} />,
      onClick: () => navigate(`/user/${user?.id}/favorites`)
    },
    {
      name: "DELETE ACCOUNT",
      className: "text-red hover:text-red-500",
      icon: <TrashIcon width={24} />,
      onClick: () => setDeleteModal(true)
    }
  ];

  return (
    <header className="bg-black/80 w-full h-16 border-b-1 border-amber-200 flex p-2 justify-between">
      <DeleteModal open={deleteModal} setOpen={setDeleteModal} />
      <MobileMenu open={mobileMenu} setOpen={setMobileMenu} user={user} menu={menu} />
      {width > 1115 && <div className="h-full text-white text-shadow-lg text-4xl flex gap-10 place-items-center pl-8">
        <Link className="hover:text-pink transition duration-150" href="/">HOME</Link>
        <Link className="hover:text-pink transition duration-150" href="/workshop">MAPS</Link>
        <Link className="hover:text-pink transition duration-150" href="/rankings">RANKINGS</Link>
        <Link className="hover:text-pink transition duration-150" href="/articles">ARTICLES</Link>
      </div>}
      {width < 1115 && <div className="w-12 flex place-items-center justify-baseline">
        <Bars3Icon
          className="text-white active:text-gray-300"
          width={40}
          height={40}
          onClick={() => setMobileMenu(true)}
        />
      </div>}
      {!hideSearch && <div
        className={clsx(
          "flex items-center w-full md:mx-16 drop-shadow-md transition-all duration-500 ease-in-out overflow-hidden",
          isAbsolute
            ? "opacity-100 translate-y-0 max-w-[1000px]"
            : "opacity-0 translate-y-[-10px] max-w-0"
        )}
      >
        <Input
          className="text-2xl w-full bg-white/10"
          placeholder="Search by name, author, id or url"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => handleEnterSearch(search, e)}
        />
        <Button
          className="text-2xl bg-white/10"
          onClick={() => handleSearch(search)}
        >SEARCH</Button>
      </div>}
      {additionalComponent}
      {width > 1115 && <div className="flex">
        {user ?
          <div className="flex gap-4 place-items-center">
            <span className="whitespace-pre-wrap text-white font-xl tracking-wider">{user.name.toUpperCase().replaceAll(" ", "\n")}</span>
            <Dropdown
              button={<img src={user.image || ""} alt="avatar" className="min-w-12 h-12 cursor-pointer" />}
              menu={menu}
              className="m-0 p-0"
            />
          </div>
          :
          <Button
            className="text-2xl bg-white/10 place-items-center text-nowrap"
            onClick={() => signIn(window.location.pathname)}
          >LOG IN</Button>
        }
      </div>}
    </header>
  );
}

export default Header
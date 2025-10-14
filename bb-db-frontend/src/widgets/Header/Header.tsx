import clsx from "clsx";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import Link from "../../shared/Link/Link";
import { useEffect, useState } from "react";
import { handleEnterSearch, handleSearch } from "../../features/SearchManager";
import { authClient, logOut, signIn } from "../../features/Auth";
import Dropdown from "../../shared/Dropdown/Dropdown";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";

const Header = ({ isAbsolute }: { isAbsolute?: boolean }) => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User>();

  useEffect(() => {
    (async () => {
      setUser((await authClient.getSession()).data?.user);
    })();
  }, []);

  const menu = [
    {
      name: "LOG OUT",
      icon: <ArrowLeftEndOnRectangleIcon width={24}/>,
      onClick: () => {
        logOut();
        setUser(undefined);
      }
    }
  ];

  return (
    <header className="bg-black/80 w-full h-16 border-b-1 border-amber-200 flex p-2 justify-between">
      <div className="h-full text-white text-shadow-lg text-4xl flex gap-10 place-items-center">
        <Link className="hover:text-pink transition duration-150" href="/">HOME</Link>
        <Link className="hover:text-pink transition duration-150" href="/workshop">MAPS</Link>
        <Link className="hover:text-pink transition duration-150" href="/rankings">RANKINGS</Link>
      </div>
      <div
        className={clsx(
          "flex items-center w-full mx-16 drop-shadow-md transition-all duration-500 overflow-hidden",
          isAbsolute
            ? "opacity-100 translate-y-0 max-w-[1000px]"
            : "opacity-0 translate-y-[-10px] max-w-0"
        )}
      >
        <Input
          className="text-3xl w-full bg-white/10"
          placeholder="Search by name, author, id or url"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => handleEnterSearch(search, e)}
        />
        <Button
          className="text-2xl bg-white/10"
          onClick={() => handleSearch(search)}
        >SEARCH</Button>
      </div>
      <div className="flex">
        {user ?
          <div className="flex gap-4 place-items-center">
            <span className="whitespace-pre-wrap text-white font-xl tracking-wider">{user.name.toUpperCase().replaceAll(" ", "\n")}</span>
            <Dropdown 
              button={<img src={user.image || ""} className="min-w-12 h-12 cursor-pointer"/>}
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
      </div>
    </header>
  );
}

export default Header
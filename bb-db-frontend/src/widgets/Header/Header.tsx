import { JSX, useCallback, useEffect, useState } from "react";
import {
  ArrowLeftEndOnRectangleIcon,
  StarIcon,
  Bars3Icon,
  TrashIcon,
  LinkIcon,
  LinkSlashIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { navigate } from "vike/client/router";
import clsx from "clsx";
import { t } from "i18next";
import { Button, Link, List, Dropdown } from "@shared";
import { logOut, signIn, unlinkSteam, DeleteModal } from "@features";
import { getUser, setUser } from "@store";
import { config } from "@config";
import { Keys } from "@locales/keys";
import { isClassic } from "@utils";
import MobileMenu from "./MobileMenu";
import Search from "./Search";
import SummaryData from "./SummaryData";

const key = Keys.header;

const Header = ({
  isAbsolute,
  additionalComponent,
  hideSearch,
}: {
  isAbsolute?: boolean;
  hideSearch?: boolean;
  additionalComponent?: JSX.Element;
}) => {
  const user = getUser();
  const [width, setWidth] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [openItemsMenu, setOpenItemsMenu] = useState(false);

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

  if (width === null) return null;

  const menu = [
    {
      name: t(key.logout),
      icon: isClassic() 
        ? <img className="w-6" src="/assets/icons/anniv-icons/Logout.png"/>
        : <ArrowLeftEndOnRectangleIcon width={24} />,
      onClick: () => {
        logOut();
        setUser(undefined);
      },
    },
    {
      name: user?.steamId
        ? t(key.profile)
        : t(key.favorites),
      icon: user?.steamId
        ? isClassic() 
          ? <img className="w-6" src="/assets/icons/anniv-icons/AuthorizationManager.png"/>
          : <UserIcon width={24} />
        : isClassic() 
          ? <img className="w-6" src="/assets/icons/anniv-icons/Favorites.png"/>
          : <StarIcon width={24} />,
        
      onClick: () => navigate(`/user/${user?.id}/favorites`),
    },
    {
      name: t(key.votes),
      icon: isClassic() 
        ? <img className="w-6" src="/assets/icons/anniv-icons/DetailView.png"/>
        : <ChartBarIcon width={24} />,
      onClick: () => navigate(`/user/${user?.id}/votes`),
    },
    {
      name: user?.steamId
        ? t(key.unlSteam)
        : t(key.lSteam),
      icon: user?.steamId 
        ? isClassic() 
          ? <img className="w-6" src="/assets/icons/anniv-icons/Setupback.png"/>
          : <LinkSlashIcon width={24} />
        : isClassic() 
          ? <img className="w-6" src="/assets/icons/anniv-icons/Setuptask.png"/>
          : <LinkIcon width={24} />,
      onClick: async () => {
        if (user?.steamId) {
          unlinkSteam();
        } else {
          window.location.replace(`${config.serverUri}/user/steam`);
        }
      },
    },
    {
      name: t(key.deleteAcc),
      className: "text-red hover:text-red-500",
      icon: isClassic() 
        ? <img className="w-6" src="/assets/icons/anniv-icons/RecycleBin(full).png"/>
        : <TrashIcon width={24} />,
      onClick: () => setDeleteModal(true),
    },
  ];

  return (
    <header
      className={clsx(
        isClassic()
          ? "flex flex-col bg-[#4269B8] h-full w-64 border-t-1 border-t-white border-r-2 border-r-classic-blue-500 border-b-1 border-b-white"
          : "bg-black/80 w-full h-16 border-b-1 border-amber-200 flex p-2 justify-between uppercase",
      )}
    >
      <DeleteModal open={deleteModal} setOpen={setDeleteModal} />
      <MobileMenu
        open={mobileMenu}
        setOpen={setMobileMenu}
        user={user}
        menu={menu}
      />
      {isClassic()
        ? width > 1115 && (
            <div>
              <div className="relative flex flex-col gap-1 pl-5 text-black text-lg p-2 m-3 border-1 border-t-32 bg-white border-classic-blue-500 rounded-sm">
                <div className="absolute text-md -top-7 text-white font-medium">Main pages</div>
                <div className="flex gap-2 place-items-center">
                  <img className="w-6" src="/assets/icons/anniv-icons/IEHome.png"/>
                  <Link className="text-blue-700 hover:underline" href="/">
                    {t(key.home)}
                  </Link>
                </div>
                <div className="flex gap-2 place-items-center">
                  <img className="w-6" src="/assets/icons/anniv-icons/ControlPanel.png"/>
                  <Link className="text-blue-700 hover:underline" href="/rankings">
                    {t(key.rankings)}
                  </Link>
                </div>
                <div className="flex gap-2 place-items-center">
                  <img className="w-6" src="/assets/icons/anniv-icons/HelpandSupport-Index.png"/>
                  <Link className="text-blue-700 hover:underline" href="/articles">
                    {t(key.articles)}
                  </Link>
                </div>
              </div>
              <div className="relative flex flex-col gap-1 pl-5 text-black text-lg p-2 m-3 border-1 border-t-32 bg-white border-classic-blue-500 rounded-sm">
                <div className="absolute text-md -top-7 text-white font-medium">Items</div>
                  <div className="flex gap-2 place-items-center">
                    <img className="w-6" src="/assets/icons/anniv-icons/EntireNetwork.png"/>
                    <Link className="text-blue-700 hover:underline" href="/workshop">
                      {t(key.maps)}
                    </Link>
                  </div>
                  <div className="flex gap-2 place-items-center">
                    <img className="w-6" src="/assets/icons/anniv-icons/DiskDefragmenter.png"/>
                    <Link className="text-blue-700 hover:underline" href="/workshop?tags=Prefabs">
                      {t(key.prefabs)}
                    </Link>
                  </div>
                  <div className="flex gap-2 place-items-center">
                    <img className="w-6" src="/assets/icons/anniv-icons/FaxArchive.png"/>
                    <Link className="text-blue-700 hover:underline" href="/workshop?tags=Collection">
                      {t(key.collections)}
                    </Link>
                  </div>
              </div>
            </div>
          )
        : width > 1115 && (
            <div className="h-full text-white text-shadow-lg text-4xl flex gap-10 place-items-center pl-8">
              {isClassic() && (
                <div className="absolute text-md -top-7 pl-5 text-white font-medium">
                  Main pages
                </div>
              )}
              <Link
                className="hover:text-pink transition duration-150"
                href="/"
              >
                {t(key.home)}
              </Link>
              <div
                className="hover:text-pink transition duration-150"
                onMouseEnter={() => setOpenItemsMenu(true)}
                onMouseLeave={() => setOpenItemsMenu(false)}
              >
                <Link className="hover:text-pink transition duration-150" href="/workshop">
                  {t(key.items)}
                </Link>
                {openItemsMenu && (
                  <List
                    className="min-w-50 pt-3 h-auto"
                    data={[
                      { name: t(key.maps), tag: "" },
                      { name: t(key.prefabs), tag: "Prefabs" },
                      { name: t(key.collections), tag: "Collection" },
                    ]}
                    displayData={(item) => item.name}
                    onItemClick={(item) =>
                      navigate(`/workshop${item.tag && "?tags=" + item.tag}`)
                    }
                  />
                )}
              </div>
              <Link className="hover:text-pink transition duration-150" href="/rankings">
                {t(key.rankings)}
              </Link>
              <Link className="hover:text-pink transition duration-150" href="/articles">
                {t(key.articles)}
              </Link>
            </div>
          )}
      {width < 1115 && (
        <div className="w-12 flex place-items-center justify-baseline">
          <Bars3Icon
            className="text-white active:text-gray-300"
            width={40}
            height={40}
            onClick={() => setMobileMenu(true)}
          />
        </div>
      )}
      <div className="flex w-full justify-center text-2xl">
        {!hideSearch && !isClassic() && <Search hide={!isAbsolute} />}
      </div>
      {additionalComponent}
      {isClassic() && 
        <SummaryData/>}
      <div className={clsx(
        isClassic() && "flex w-full h-full justify-center place-items-end p-2"
      )}>
        {width > 1115 && (
          <div className="flex h-fit">
            {user ? (
              <div className="flex gap-4 place-items-center">
                <span className="whitespace-pre-wrap text-white font-xl tracking-wider">
                  {user.name.toUpperCase().replaceAll(" ", "\n")}
                </span>
                <Dropdown
                  button={
                    <img
                      src={user.image || ""}
                      alt="avatar"
                      className="min-w-12 h-12 cursor-pointer"
                    />
                  }
                  menu={menu}
                  className={clsx("m-0 p-0", isClassic() && "-top-40 -left-28")}
                />
              </div>
            ) : (
              <Button
                className={clsx(
                  isClassic()
                    ? "text-black"
                    : "text-2xl bg-white/10 place-items-center text-nowrap uppercase py-2"
                )}
                onClick={() => signIn(window.location.pathname)}
              >
                {t(key.login)}
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import { Link } from "@shared";
import i18n, { supportedLanguages } from "@locales/config";
import clsx from "clsx";
import { isClassic } from "@/utils";

const Footer = () => {
  return (
    <footer className={clsx(
      isClassic()
        ? "w-full mt-12 bg-classic-blue-400 border-t-1 border-classic-blue-200 flex gap-6 h-full text-white text-xs"
        : "w-full mt-12 py-6 px-2 bg-black/80 text-[#f1e4c7] text-center text-2xl flex flex-col items-center gap-2 border-t border-[#f1e4c733]"
    )}>
      <p className="tracking-wide text-center">
        © {new Date().getFullYear()} Beton Brutal Database | Paradise Co. | dot-Proxe Technologies
      </p>
      <p className={isClassic() ? "text-center" : "opacity-70"}>
        Powered by <span className="font-semibold tracking-wider">React, Vike and TailwindCSS</span>
      </p>
      <div className={clsx("flex gap-1 sm:gap-6 place-items-center", !isClassic() && "opacity-50")}>
        <Link className="text-green hover:opacity-100 hover:underline text-center" href="/privacy-policy">Privacy Policy</Link>
        <p className={isClassic() ? "text-black" : ""}>|</p>
        <Link className="text-blue hover:opacity-100 hover:underline text-center" href="https://discord.com/invite/DqKwJyugGv">BETON BRUTAL Discord server</Link>
        <p className={isClassic() ? "text-black" : ""}>|</p>
        <Link className="text-yellow hover:opacity-100 hover:underline text-center" href="https://josiahshields.com/beton/">BBLB</Link>
        {isClassic() && <p className={isClassic() ? "text-black" : ""}>|</p>}
      </div>
      <div className="flex gap-1 sm:gap-6 place-items-center">
        {supportedLanguages.map((lang, i) => (
          <div className="flex gap-6" key={i}>
            <a
              className={isClassic() ? "hover:underline" : "opacity-50 hover:opacity-100 hover:underline"}
              onClick={() => window.location.href = `/?lang=${i18n.getResource(lang, "translation", "language")}`}
            >{i18n.getResource(lang, "translation", "localLanguage")}</a>
            {i < supportedLanguages.length-1 && <p className={isClassic() ? "text-black" : "opacity-50"}>|</p>}
          </div>
        ))}
      </div>
      <div className={clsx("flex gap-1 sm:gap-6 place-items-center", isClassic() ? "" : "opacity-50")}>
        {isClassic() && <p className={isClassic() ? "text-black" : ""}>|</p>}
        <Link className="hover:opacity-100 hover:underline text-center" href="/api/docs">BBDB Api</Link>
        <p className={isClassic() ? "text-black" : ""}>|</p>
        <Link className="text-blue hover:opacity-100 hover:underline text-center" href="https://github.com/Xannix246/BetonBrutal-Database">GitHub source page</Link>
      </div>
    </footer>
  );
}

export default Footer;
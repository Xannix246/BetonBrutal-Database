import i18n, { resources, supportedLanguages } from "../../../i18n/config";
import Link from "../../shared/Link/Link";

const Footer = () => {
  return (
    <footer className="w-full mt-12 py-6 px-2 bg-black/80 text-[#f1e4c7] text-center text-2xl flex flex-col items-center gap-2 border-t border-[#f1e4c733]">
      <p className="tracking-wide">
        © {new Date().getFullYear()} Beton Brutal Database | Paradise Co. | dot-Proxe Technologies
      </p>
      <p className="opacity-70">
        Powered by <span className="font-semibold tracking-wider">React, Vike and TailwindCSS</span>
      </p>
      <div className="flex gap-1 sm:gap-6 place-items-center">
        <Link className="text-green opacity-50 hover:opacity-100 hover:underline" href="/privacy-policy">Privacy Policy</Link>
        |
        <Link className="text-blue opacity-50 hover:opacity-100 hover:underline" href="https://discord.com/invite/DqKwJyugGv">BETON BRUTAL Discord server</Link>
        |
        <Link className="text-yellow opacity-50 hover:opacity-100 hover:underline" href="https://josiahshields.com/beton/">BBLB</Link>
      </div>
      <div className="flex gap-1 sm:gap-6 place-items-center">
        {supportedLanguages.map((lang, i) => (
          <div className="flex gap-6" key={i}>
            <Link
              className="opacity-50 hover:opacity-100 hover:underline"
              href={`/?lang=${i18n.getResource(lang, "translation", "language")}`}
            >{i18n.getResource(lang, "translation", "localLanguage")}</Link>
            {i < supportedLanguages.length-1 && "|"}
          </div>
        ))}
      </div>
      <div className="flex gap-1 sm:gap-6 place-items-center">
        <Link className="opacity-50 hover:opacity-100 hover:underline" href="/api/docs">BBDB Api</Link>
        |
        <Link className="text-blue opacity-50 hover:opacity-100 hover:underline" href="https://github.com/Xannix246/BetonBrutal-Database">GitHub source page</Link>
      </div>
    </footer>
  );
}

export default Footer;
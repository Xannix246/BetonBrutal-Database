import Link from "../../shared/Link/Link";

const Footer = () => {
  return (
    <footer className="w-full mt-12 py-6 bg-black/80 text-[#f1e4c7] text-center text-2xl flex flex-col items-center gap-2 border-t border-[#f1e4c733]">
      <p className="tracking-wide">
        © {new Date().getFullYear()} Beton Brutal Database | Paradise Co. | dot-Proxe Technologies
      </p>
      <p className="opacity-70">
        Powered by <span className="font-semibold tracking-wider">React, Vike and TailwindCSS</span>
      </p>
      <div className="flex gap-6 place-items-center">
        <p className="text-xl opacity-50">
          Some footer 🧱
        </p>
        |
        <Link className="text-blue opacity-50 hover:opacity-100 hover:underline" href="https://discord.com/invite/DqKwJyugGv">BETON BRUTAL Discord server</Link>
        |
        <Link className="text-yellow opacity-50 hover:opacity-100 hover:underline" href="https://josiahshields.com/beton/">BBLB</Link>
      </div>
    </footer>
  );
}

export default Footer;
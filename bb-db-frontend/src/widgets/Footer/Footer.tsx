const Footer = () => {
  return (
    <footer className="w-full mt-12 py-6 bg-black/80 text-[#f1e4c7] text-center text-2xl flex flex-col items-center gap-2 border-t border-[#f1e4c733]">
      <p className="tracking-wide">
        © {new Date().getFullYear()} Beton Brutal Database | Paradise Co. | dot-Proxe Technologies
      </p>
      <p className="opacity-70">
        Powered by <span className="font-semibold tracking-wider">React, Vike and TailwindCSS</span>
      </p>
      <p className="text-xl opacity-50">
        Some footer 🧱
      </p>
    </footer>
  );
}

export default Footer;
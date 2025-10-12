import clsx from "clsx";
import { usePageContext } from "vike-react/usePageContext";

const Link = ({ href, children, className }: { href: string; children: string; className: string }) => {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const isActive = href === "/" ? urlPathname === href : urlPathname.startsWith(href);
  return (
    <a href={href} className={clsx(isActive ? "is-active" : undefined, className)}>
      {children}
    </a>
  );
}

export default Link;

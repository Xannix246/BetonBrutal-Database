import clsx from "clsx";
import Link from "../shared/Link/Link";

const ArticleTile = ({ article }: { article: Article }) => {

  return (
    <div className="h-64 relative hover:z-5 z-0 transition-all transform duration-300">
      <a
        className="w-full group absolute"
        href={`/articles/${article.id}`}
      >
        <div className="bg-black group">
          <div className="relative h-64 w-full">
            {article.previewUrl && <img src={article.previewUrl} alt={article.title} className="w-full h-64 object-cover absolute" />}
            <div className="bg-gradient-to-b from-transparent to-black absolute inset-0" />
            <h1 className="text-4xl md:text-6xl tracking-wide text-white absolute p-2 text-shadow-sm">{article.title}</h1>
            <div className="absolute bottom-0 w-full flex flex-col md:flex-row justify-between place-items-center text-gray-400 text-2xl p-2">
              <h1 className="text-2xl w-full tracking-wide text-gray-400 p-2">BY {article.author.toUpperCase()}</h1>
              <div className="flex w-full justify-between">
                <div className="flex gap-2">
                  {article.tags.map((tag, i) => (
                    <Link key={i} href="" className="hover:text-pink transition duration-300">{`#${tag}`}</Link>
                  ))}
                </div>
                {new Date(article.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className={clsx(
            "flex justify-between place-items-center group overflow-hidden",
            "transition-all duration-300 ease-in-out",
            "h-0 opacity-0 group-hover:h-64 group-hover:md:h-56 group-hover:opacity-100"
          )}>
            <div className="p-2">
              <h2 className="text-2xl tracking-wide text-gray-300 wrap-anywhere">{article.description}</h2>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default ArticleTile;

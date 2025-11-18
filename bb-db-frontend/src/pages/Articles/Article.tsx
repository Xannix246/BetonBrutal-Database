import { useEffect, useState } from "react";
import Background from "../../widgets/Background/Background";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Link from "../../shared/Link/Link";
import PreviewPane from "../../features/editor/Preview";
import { getArticle } from "./requests";
import Container from "../../shared/Containter/Container";

const Article = ({ id }: { id: string }) => {
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const article = await getArticle(id);
      setArticle(article);

      if (article) setLoaded(true);
    })();
  }, []);

  return (
    <div className="w-full h-screen bg-center bg-fixed bg-no-repeat bg-cover">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col justify-between min-h-screen pt-32 gap-8">
        {loaded ?
          <div className="relative flex gap-2 px-2 sm:px-4 min-h-screen">
            <div className="lg:w-sm">

            </div>
            <div className="w-full">
              <div className="bg-black">
                <div className="relative h-64">
                  {article?.previewUrl && <img src={article.previewUrl} alt={article.title} className="w-full h-64 object-cover absolute" />}
                  <div className="bg-gradient-to-b from-transparent to-black absolute inset-0" />
                </div>
                <div className="flex justify-between p-4 place-items-center">
                  <h1 className="text-4xl sm:text-7xl tracking-wide text-white">{article?.title}</h1>
                  <h4 className="text-2xl text-gray-400">{article?.date && new Date(article.date).toLocaleDateString()}</h4>
                </div>
                <div className="flex justify-between flex-col md:flex-row gap-4">
                  <div className="text-gray-300 flex gap-8 px-4 text-2xl">BY: {article?.author.toUpperCase()}</div>
                  <div className="text-gray-300 flex gap-8 px-4 text-2xl md:justify-end">
                    {article?.tags.map((tag, i) => (
                      //search by tag
                      <Link key={i} href="" className="hover:text-pink transition duration-300">{`#${tag}`}</Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="h-64 bg-gradient-to-t from-transparent to-black absolute inset-0 -z-10" />
                <PreviewPane document={article?.content} />
              </div>
            </div>
            <div className="lg:w-sm">

            </div>
          </div>
          :
          <div className="flex gap-2 pt-32 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full">
                {article === null ? "ARTICLE NOT FOUND" : "CHECKING WHAT'S NEW..."}
              </Container>
            </div>
          </div>
        }

        <Footer />
      </div>
    </div>
  );
}

export default Article;

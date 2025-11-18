import Background from "../../widgets/Background/Background";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import { useEffect, useState } from "react";
import EditorSidebar from "../../features/editor/EditorSidebar";
import EditorToolbar from "../../features/editor/EditorToolbar";
import PreviewPane from "../../features/editor/Preview";
import EditorView from "../../features/editor/EditorView";
import clsx from "clsx";
import { Button, Input } from "@headlessui/react";
import { uploadArticle, uploadFiles } from "./requests";
import EditorDatabar from "../../features/editor/EditorDatabar";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Textarea from "../../shared/Textarea/Textarea";
import { navigate } from "vike/client/router";
import Link from "../../shared/Link/Link";
import { getUser } from "../../store/store";

const Editor = () => {
  const [title, setTitle] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [preview, setPreview] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [descWindow, descWindowOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    (async () => {
      if (!["writer", "admin"].includes(user?.role as string)) {
        return navigate("/articles");
      }
    })();
  }, []);

  const onPublish = async () => {
    if (title === "") return;
    await uploadFiles();
    const id = await uploadArticle(title, description, tags, preview);

    await navigate(`/articles/${id}`);
  }

  return (
    <div className="w-full h-screen bg-center bg-fixed bg-no-repeat bg-cover">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header
          additionalComponent={
            <div className="h-full text-white text-shadow-lg text-4xl flex gap-10 place-items-center pl-8">
              <Button className="hover:text-pink transition duration-150" onClick={onPublish}>PUBLISH</Button>
            </div>
          }
          hideSearch={true}
        />
      </div>

      <div className="flex flex-col min-h-screen pt-32 gap-8">
        <Container className="flex justify-center gap-10 text-2xl md:text-4xl tracking-wide place-items-center text-white">
          ARTICLE EDITOR
        </Container>

        <div className="relative flex gap-2 px-4">
          <div className="sticky h-[calc(100vh-72px)] top-18">
            <EditorSidebar />
          </div>

          <div className="relative flex flex-col gap-2 w-full">
            <div className={clsx(
              "flex h-12 bg-white/30 w-full z-20 justify-center place-items-center",
              "sticky top-18"
            )}>
              <EditorToolbar
                preview={previewMode}
                onTogglePreview={() => setPreviewMode((p) => !p)}
                onFormat={(type) => {
                  const event = new CustomEvent("editor-format", { detail: type });
                  window.dispatchEvent(event);
                }}
              />
            </div>

            {!previewMode && <div className="flex w-full justify-center place-content-center bg-black/80">
              <Input
                className="text-center outline-0 text-white text-6xl w-full p-2"
                autoComplete="off"
                placeholder="Type title here..."
                value={title}
                onChange={e => e.target.value.length < 64 && setTitle(e.target.value.toUpperCase())}
              />
            </div>}

            {!previewMode && <div className={clsx(
              "flex flex-col w-full bg-black/80 transition-[height] duration-300",
              descWindow ? "h-64" : "h-14"
            )}>
              <div className="flex h-fit" onClick={() => descWindowOpen(!descWindow)}>
                <ChevronRightIcon width={40} className={clsx(
                  "text-white transform duration-300",
                  descWindow ? "rotate-90" : "rotate-0"
                )} />
                <h2 className="text-4xl tracking-wider text-white p-2 select-none">DESCRIPTION (OPTIONAL | 256 SYMBOLS)</h2>
              </div>

              <Textarea
                placeholder="Type description here"
                className={clsx(
                  "text-xl text-gray-300 bg-transparent p-2 transition duration-300",
                  descWindow ? "opacity-100" : "opacity-0"
                )}
                onChange={(e) => {
                  const eValue = e.target.value.slice(0, 255);

                  if (description.length < 256 || description.length > eValue.length) setDescription(eValue)
                }}
                value={description}
              />
            </div>}

            {previewMode ? (
              <div className="w-full">
                <div className="bg-black">
                  <div className="relative h-64">
                    {preview && <img src={URL.createObjectURL(preview)} alt={preview.name} className="w-full h-64 object-cover absolute" />}
                    <div className="bg-gradient-to-b from-transparent to-black absolute inset-0" />
                  </div>
                  <div className="flex justify-between p-4 place-items-center">
                    <h1 className="text-7xl tracking-wide text-white">{title || "EXAMPLE TITLE"}</h1>
                    <h4 className="text-2xl text-gray-400">{new Date().toLocaleDateString()}</h4>
                  </div>
                  <div className="text-gray-300 flex gap-8 px-4 text-2xl justify-end">
                    {tags.map((tag, i) => (
                      <Link key={i} href="" className="hover:text-pink transition duration-300">{`#${tag}`}</Link>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="h-64 bg-gradient-to-t from-transparent to-black absolute inset-0 -z-10" />
                  <PreviewPane />
                </div>
              </div>
            ) : (
              <EditorView />
            )}
          </div>

          <div className="sticky h-[calc(100vh-72px)] top-18">
            <EditorDatabar
              preview={preview}
              setPreview={setPreview}
              tags={tags}
              setTags={setTags}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Editor;

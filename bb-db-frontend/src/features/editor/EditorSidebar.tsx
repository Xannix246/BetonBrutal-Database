import Button from "../../shared/Button/Button";
import Container from "../../shared/Containter/Container";
import { getDoc, getFiles, setDoc, setFiles } from "../../store/store";

const EditorSidebar = () => {
  const files = getFiles();
  const doc = getDoc();

  const deleteImage = (name: string) => {
    setFiles(files.filter((f) => f.name !== name));

    const encodedName = encodeURIComponent(name);
    const escaped = encodedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`!\\[.*?\\]\\(${escaped}\\)\\r?\\n?`, "gm");

    setDoc(doc.replace(regex, ""));
  }

  const insertImage = (name: string) => {
    setDoc(doc + `\n ![${name}](${encodeURIComponent(name)})`);
  }

  return (
    <Container className="flex flex-col text-white place-items-center p-4 bg-black/60 w-[250px] h-full">
      <div className="text-xl font-bold mb-2">IMAGES</div>
      {files.length === 0 && (
        <div className="text-xl opacity-70">Drop images into editor</div>
      )}
      <div className="w-full overflow-y-auto grid gap-2 mt-2 scrollbar-hide">
        {files.map((file, i) => {
          const url = URL.createObjectURL(file);

          return (
            <div key={i}>
              <div className="relative flex h-full place-content-center">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full object-cover"
                />
                <div
                  className="absolute flex flex-col gap-2 opacity-0 w-full h-full transition-all duration-150 hover:bg-black/30 hover:opacity-100 hover:backdrop-blur-xs justify-center place-items-center"
                >
                  <Button
                    onClick={() => deleteImage(file.name)}
                    className="tracking-wider hover:bg-red/40 p-2"
                  >DELETE IMAGE</Button>
                  <Button
                    onClick={() => insertImage(file.name)}
                    className="tracking-wider p-2"
                  >INSERT IN THE END</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default EditorSidebar;

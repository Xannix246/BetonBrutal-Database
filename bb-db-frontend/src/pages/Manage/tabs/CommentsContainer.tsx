import { useEffect, useState } from "react";
import { getActiveMap } from "../../../store/store";
import { deleteComment, getComments } from "../requests";
import Comment from "../../../entities/Comment/Comment";
import Button from "../../../shared/Button/Button";

const CommentsContainer = () => {
  const activeMap = getActiveMap();
  const [comments, setComments] = useState<UserComment[]>([]);

  useEffect(() => {
    if (activeMap) {
      (async () => {
        setComments(
          (await getComments(activeMap.steamId)).sort(
            (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
          ),
        );
      })();
    }
  }, [activeMap]);

  const handleDelete = async (id: string) => {
    await deleteComment(id);

    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="tracking-wider text-4xl text-white uppercase mb-4" id="comments">
        Comments:
      </h2>
      {comments.map((comment, i) => (
        <div key={i} className="flex w-full">
          <div className="flex-1">
            <Comment comment={comment} />
          </div>
          <Button
            className="uppercase py-0 place-items-center duration-300 text-white hover:bg-red/50"
            onClick={() => handleDelete(comment.id)}
          >
            Delete comment
          </Button>
        </div>
      ))}
    </div>
  );
};

export default CommentsContainer;

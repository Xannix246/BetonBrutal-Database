import clsx from "clsx";
import { Container } from "@shared";
import { isClassic } from "@utils";

type Props = {
  comment: UserComment;
}

const Comment = ({ comment }: Props) => {
  return (
    <Container className={clsx(
      isClassic()
        ? "container-yellow mx-4 p-1"
        : "mx-2 tracking-wider"
    )}>
      <div className="flex justify-between">
        <h3 className={clsx(
          !isClassic() && "text-lg text-[#f1e4c7] uppercase"
        )}>{comment.username}</h3>
        <h3 className={clsx(
          !isClassic() && "text-lg text-gray-400 uppercase"
        )}>At {new Date(comment.createdAt).toLocaleDateString()} | {new Date(comment.createdAt).toLocaleTimeString()}</h3>
      </div>
      <h4 className={clsx(
        isClassic()
          ? "pl-4"
          : "text-xl text-white pl-8"
      )}>{comment.data}</h4>
    </Container>
  );
}

export default Comment;

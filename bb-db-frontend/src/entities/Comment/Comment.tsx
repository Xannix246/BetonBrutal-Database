import Container from "../../shared/Containter/Container";

type Props = {
  comment: UserComment;
}

const Comment = ({ comment }: Props) => {
  return (
    <Container className="mx-2 tracking-wider">
      <div className="flex justify-between">
        <h3 className="text-lg text-[#f1e4c7]">{comment.username.toUpperCase()}</h3>
        <h3 className="text-lg text-gray-400">AT {new Date(comment.createdAt).toLocaleDateString()} | {new Date(comment.createdAt).toLocaleTimeString()}</h3>
      </div>
      <h4 className="text-xl text-white pl-8">{comment.data}</h4>
    </Container>
  );
}

export default Comment;

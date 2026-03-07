import { useState } from "react";

type Props = {
  user: User;
  player: Player;
}

const UserProfile = ({ user, player }: Props) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <div>

    </div>
  );
}

export default UserProfile;

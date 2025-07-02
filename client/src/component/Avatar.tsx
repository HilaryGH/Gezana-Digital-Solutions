// components/Avatar.tsx
interface AvatarProps {
  name: string;
}

const Avatar = ({ name }: AvatarProps) => {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center mr-4 shadow">
      {initials}
    </div>
  );
};

export default Avatar;

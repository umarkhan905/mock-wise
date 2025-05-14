import Spinner from "./Spinner";

export const LoadingScreen = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner message={message} />
    </div>
  );
};

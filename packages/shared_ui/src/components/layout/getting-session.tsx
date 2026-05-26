import { Loader } from "lucide-react";

type Props = {
  message: string;
  hideLoader?: boolean;
};

const GettingSession = ({ message, hideLoader }: Props) => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {message}
        {!hideLoader && <Loader className="animate-spin" />}
      </div>
    </div>
  );
};

export default GettingSession;

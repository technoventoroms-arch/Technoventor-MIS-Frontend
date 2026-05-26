import { PropsWithChildren } from "react";

type Props = {
  count?: number;
};

const RepeatElement = ({ count = 4, children }: PropsWithChildren<Props>) => {
  return Array.from({ length: count }, () => children);
};

export default RepeatElement;

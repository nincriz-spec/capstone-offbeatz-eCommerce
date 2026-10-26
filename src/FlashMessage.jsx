import { useFlash } from "./FlashStore";

export default function FlashMessage() {
  const { flash } = useFlash();

  if (!flash) return null;

  return <div className={`flash flash-${flash.type}`}>{flash.message}</div>;
}
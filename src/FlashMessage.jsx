import { useFlash } from "./FlashStore";

export default function FlashMessage() {
  const { flashMessage, clearMessage } = useFlash();

  if (!flashMessage.message) return null;

  return (
    <div className={`flash flash-${flashMessage.type}`}>
      <span>{flashMessage.message}</span>
      <button onClick={clearMessage}>×</button>
    </div>
  );
}
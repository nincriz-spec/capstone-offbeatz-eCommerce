import { atom, useAtom } from "jotai";

const flashAtom = atom(null);

export function useFlash() {
  const [flash, setFlash] = useAtom(flashAtom);

  function showFlash(message, type = "success") {
    setFlash({ message, type });
    setTimeout(() => setFlash(null), 3000);
  }

  return { flash, showFlash };
}
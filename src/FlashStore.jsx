
import { atom, useAtom } from 'jotai';

const flashStoreAtom = atom({
    message: '',
    type: 'info'
})

export const useFlash = () => {

    const [flashMessage, setFlashStore] = useAtom(flashStoreAtom);

    const showMessage = (message, type="info" ) => {
        setTimeout(()=>{
            clearMessage();
        }, 6000);

        setFlashStore({
            message, type
        })
    }

    const clearMessage = () => {
        setFlashStore({
            message: '',
            type: 'info'
        })
    }

    return {
        showMessage,
        flashMessage,
        clearMessage
    }
}


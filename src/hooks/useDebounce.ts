import { useEffect, useState } from "react";


const useDebounce = (searchString: string, timeout: number = 1000) => {
    const [debounced, setDebounced] = useState<string>(searchString);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(searchString);
        }, timeout);

        return () => {
            clearTimeout(handler);
        };
    }, [searchString, timeout]);

    const setImmediateValue = (value: string) => {
        setDebounced(value);
    };

    return {
        debounced,
        setImmediateValue
    };
};

export default useDebounce;
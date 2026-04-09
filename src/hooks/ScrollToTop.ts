import { useEffect } from "react";

const useScrollToTop = () => {
    useEffect(() => {
        const scrollContainer = document.getElementById("app-scroll-container");
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);
};

export default useScrollToTop;

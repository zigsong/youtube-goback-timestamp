"use strict";
document.addEventListener("DOMContentLoaded", () => {
    commentsContainerObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
});
const observeOriginContainer = (commentNode, originContainer, toastContainer) => {
    const options = {
        threshold: 1.0,
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                originContainer.insertBefore(commentNode, originContainer.lastElementChild);
                toastContainer.remove();
                observer.unobserve(originContainer);
            }
        });
    }, options);
    observer.observe(originContainer);
};
const handleClickTimeStamp = (commentNode, originContainer) => {
    // MARK: copy할 수 있는 방안을 찾기
    const bottomArea = document.querySelector("div#below");
    const toastContainer = document.createElement("div");
    toastContainer.setAttribute("style", "width: 100%; border: 2px dashed #32A6FF; margin-top: 12px; padding: 12px; box-sizing: border-box; border-radius: 12px; cursor: pointer;");
    toastContainer.addEventListener("mouseover", () => {
        toastContainer.style.background = "rgba(50, 166, 255, 0.2)";
    });
    toastContainer.addEventListener("mouseout", () => {
        toastContainer.style.background = "none";
    });
    toastContainer.appendChild(commentNode);
    bottomArea.insertBefore(toastContainer, bottomArea.firstChild);
    setTimeout(() => {
        observeOriginContainer(commentNode, originContainer, toastContainer);
    }, 1000);
    toastContainer.addEventListener("click", () => {
        originContainer.insertBefore(commentNode, originContainer.lastElementChild);
        originContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        toastContainer.remove();
    }, { capture: true });
};
// MARK: MutationObserver가 2번 호출되는 버그 방지
let isContainerLoaded = false;
const commentsContainerLoaded = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        const target = mutation.target;
        if (target.id === "comments") {
            if (isContainerLoaded)
                return;
            const commentsContainer = target.querySelector("#contents");
            if (commentsContainer) {
                commentsContentObserver.observe(commentsContainer, {
                    childList: true,
                    subtree: true,
                });
                isContainerLoaded = true;
            }
            observer.disconnect();
        }
    }
};
const commentsContentLoaded = (mutationsList) => {
    for (const mutation of mutationsList) {
        const target = mutation.target;
        if (target.tagName === "YTD-COMMENT-THREAD-RENDERER") {
            const thread = target;
            const content = thread.querySelector("#comment-content");
            if (!content)
                continue;
            const links = content.querySelectorAll("a");
            const timestamps = [...links].filter((a) => { var _a; return (_a = a.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.startsWith("/watch?v"); });
            if (timestamps.length > 0) {
                timestamps.forEach((timestamp) => {
                    // timestamp.style.color = "orange";
                    timestamp.addEventListener("click", () => handleClickTimeStamp(content, thread.querySelector("#main")));
                });
            }
            // TODO: 언제 호출해야 하는지?
            // observer.disconnect();
        }
    }
};
const commentsContainerObserver = new MutationObserver(commentsContainerLoaded);
const commentsContentObserver = new MutationObserver(commentsContentLoaded);

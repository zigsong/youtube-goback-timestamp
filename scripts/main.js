"use strict";
chrome.runtime.onMessage.addListener(function (request) {
    console.log("url change", request.url);
    /** TODO: 목록이 아닌 영상 url일 때만 실행하도록 분리 */
    reset();
});
// MARK: MutationObserver가 2번 호출되는 버그 방지
let isContainerLoaded = false;
const reset = () => {
    commentsContainerObserver.disconnect();
    const toastContainer = document.querySelector("div.toast-container");
    if (toastContainer) {
        toastContainer.remove();
    }
    isContainerLoaded = false;
    commentsContainerObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
};
document.addEventListener("DOMContentLoaded", () => {
    commentsContainerObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
});
/** MARK: toast가 뜬 상태에서 스크롤을 내리면 원래대로 돌아가게끔 */
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
const commentsContainerLoaded = (mutationsList) => {
    const comments = document.querySelector("#comments");
    if (comments) {
        const commentsContent = comments.querySelector("#contents");
        if (commentsContent) {
            isContainerLoaded = true;
            commentsContent.addEventListener("click", handleClickComment);
            return;
        }
    }
    for (const mutation of mutationsList) {
        const target = mutation.target;
        if (target.id === "comments") {
            if (isContainerLoaded)
                return;
            const commentsContent = target.querySelector("#contents");
            if (commentsContent) {
                isContainerLoaded = true;
                commentsContent.addEventListener("click", handleClickComment);
            }
        }
    }
};
const handleClickTimeStamp = (commentNode, originContainer) => {
    // MARK: copy할 수 있는 방안을 찾기
    const bottomArea = document.querySelector("div#below");
    const toastContainer = document.createElement("div");
    toastContainer.classList.add("toast-container");
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
    toastContainer.addEventListener("click", (e) => {
        if (e.target.tagName === "A")
            return;
        originContainer.insertBefore(commentNode, originContainer.lastElementChild);
        originContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        toastContainer.remove();
    });
};
const handleClickComment = (e) => {
    var _a, _b, _c;
    const target = e.target;
    if ((_a = target.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.startsWith("/watch?v")) {
        handleClickTimeStamp(target.parentElement, (_c = (_b = target.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.parentElement);
    }
};
const commentsContainerObserver = new MutationObserver(commentsContainerLoaded);

chrome.runtime.onMessage.addListener(function (request) {
  if (request.url.includes("watch")) {
    reset();
  }
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
const observeOriginContainer = (
  commentNode: HTMLElement,
  originContainer: HTMLElement,
  toastContainer: HTMLElement
) => {
  const options = {
    threshold: 1.0,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        originContainer.insertBefore(
          commentNode,
          originContainer.lastElementChild
        );
        toastContainer.remove();
        observer.unobserve(originContainer);
      }
    });
  }, options);

  observer.observe(originContainer);
};

const commentsContainerLoaded: MutationCallback = (mutationsList) => {
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
    const target = mutation.target as HTMLElement;

    if (target.id === "comments") {
      if (isContainerLoaded) return;

      const commentsContent = target.querySelector("#contents");
      if (commentsContent) {
        isContainerLoaded = true;
        commentsContent.addEventListener("click", handleClickComment);
      }
    }
  }
};

const handleClickTimeStamp = (
  commentNode: HTMLElement,
  originContainer: HTMLElement
) => {
  // MARK: copy할 수 있는 방안을 찾기
  const bottomArea = document.querySelector("div#below") as HTMLElement;
  const toastContainer = document.createElement("div");
  toastContainer.classList.add("toast-container");

  toastContainer.setAttribute(
    "style",
    "width: 100%; border: 2px dashed #32A6FF; margin-top: 12px; padding: 12px; box-sizing: border-box; border-radius: 12px; cursor: pointer;"
  );

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

  toastContainer.addEventListener("click", (e: Event) => {
    if ((e.target as HTMLElement).tagName === "A") return;

    originContainer.insertBefore(commentNode, originContainer.lastElementChild);
    originContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    toastContainer.remove();
  });
};

const handleClickComment = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.getAttribute("href")?.startsWith("/watch?v")) {
    handleClickTimeStamp(
      target.parentElement as HTMLElement,
      target.parentElement?.parentElement?.parentElement as HTMLElement
    );
  }
};

const commentsContainerObserver = new MutationObserver(commentsContainerLoaded);

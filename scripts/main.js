document.addEventListener("DOMContentLoaded", () => {
  commentsContainerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

const observeOriginContainer = (
  commentNode,
  originContainer,
  toastContainer
) => {
  const options = {
    threshold: 1.0,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        originContainer.insertBefore(commentNode, originContainer.firstChild);
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

  observeOriginContainer(commentNode, originContainer, toastContainer);

  toastContainer.addEventListener("click", () => {
    originContainer.insertBefore(commentNode, originContainer.firstChild);
    originContainer.scrollIntoView({ behavior: "smooth" });
    toastContainer.remove();
  });
};

// MARK: MutationObserver가 2번 호출되는 버그 방지
let isContainerLoaded = false;

const commentsContainerLoaded = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.id === "comments") {
      if (isContainerLoaded) return;

      const commentsContainer = mutation.target.querySelector("#contents");
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

const commentsContentLoaded = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.tagName === "YTD-COMMENT-THREAD-RENDERER") {
      const thread = mutation.target;
      const content = thread.querySelector("#comment-content");

      if (!content) continue;

      const timestamps = content.querySelectorAll("a");

      if (timestamps.length > 0) {
        timestamps.forEach((timestamp) => {
          if (!timestamp.textContent.startsWith("#")) {
            // timestamp.style.color = "orange";
            timestamp.addEventListener("click", () => {
              handleClickTimeStamp(content, thread.querySelector("#expander"));
            });
          }
        });
      }
      // TODO: 언제 호출해야 하는지?
      // observer.disconnect();
    }
  }
};

const commentsContainerObserver = new MutationObserver(commentsContainerLoaded);
const commentsContentObserver = new MutationObserver(commentsContentLoaded);

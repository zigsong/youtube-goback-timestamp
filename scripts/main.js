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
        console.log("내려왔다!");
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

  const descArea = document.querySelector("div#description");
  console.log("descArea", descArea.style.background);

  toastContainer.setAttribute(
    "style",
    "width: 100%; border: 2px solid #32A6FF; margin-top: 12px; padding: 12px; box-sizing: border-box; border-radius: 12px; cursor: pointer;"
  );

  toastContainer.appendChild(commentNode);
  bottomArea.insertBefore(toastContainer, bottomArea.firstChild);

  observeOriginContainer(commentNode, originContainer, toastContainer);

  toastContainer.addEventListener("click", () => {
    originContainer.insertBefore(commentNode, originContainer.firstChild);
    originContainer.scrollIntoView({ behavior: "smooth" });
    toastContainer.remove();
  });
};

const observeContents = (container) => {
  // TODO: setTimeout 삭제하고 개선하기
  setTimeout(() => {
    const comments = container.querySelectorAll("#comment-content");
    comments.forEach((comment) => {
      const content = comment.querySelector("#content");
      const timestamps = content.querySelectorAll("a");

      if (timestamps.length > 0) {
        timestamps.forEach((timestamp) => {
          if (!timestamp.textContent.startsWith("#")) {
            timestamp.addEventListener("click", () => {
              console.log("content", content);
              handleClickTimeStamp(content, comment.querySelector("#expander"));
            });
          }
        });
      }
    });
  }, 3000);
};

// MARK: MutationObserver가 2번 호출되는 버그 방지
let isContainerLoaded = false;

const commentsContainerLoaded = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.id === "comments") {
      if (isContainerLoaded) return;

      const commentsContainer = mutation.target.querySelector("#contents");
      if (commentsContainer) {
        observeContents(commentsContainer);
        isContainerLoaded = true;
      }

      observer.disconnect();
    }
  }
};

const commentsContentLoaded = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    console.log(mutation.target.id);

    if (mutation.target.id === "content-text") {
      const timestamp = mutation.target.querySelector("a");

      if (timestamp) {
        timestamp.style.color = "orange";
      }

      observer.disconnect();
    }
  }
};

const commentsContainerObserver = new MutationObserver(commentsContainerLoaded);

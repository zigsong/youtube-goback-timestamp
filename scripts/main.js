document.addEventListener("DOMContentLoaded", () => {
  commentsContainerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("DOMContentLoaded");
});

const handleClickTimeStamp = (commentNode) => {
  console.log("wow!", commentNode.textContent);
};

const observeContents = (container) => {
  console.log("container", container);

  // commentsContentObserver.observe(container, {
  //   childList: true,
  //   subtree: true,
  // });

  setTimeout(() => {
    const comments = container.querySelectorAll("#content-text");
    comments.forEach((comment) => {
      // console.log(comment.textContent);
      const timestamps = comment.querySelectorAll("a");
      if (timestamps.length > 0) {
        timestamps.forEach((timestamp) => {
          if (!timestamp.textContent.startsWith("#")) {
            timestamp.style.color = "orange";
            timestamp.addEventListener("click", () => {
              console.log("여기", comment.textContent);
              handleClickTimeStamp(comment);
            });
          }
        });
        // console.log(timestamp.textContent);
      }
    });
  }, 2000);
};

const commentsContainerLoaded = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.id === "comments") {
      const commentsContainer = mutation.target.querySelector("#contents");
      // console.log("commentsContainer:", commentsContainer);

      if (commentsContainer) {
        observeContents(commentsContainer);
      }

      observer.disconnect();
    }
  }
};

const commentsContentLoaded = (mutationsList, observer) => {
  console.log("commentsContentLoaded");

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
const commentsContentObserver = new MutationObserver(commentsContentLoaded);

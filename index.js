import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let storedFeed = localStorage.getItem("FullFeed");

if (storedFeed) {
  tweetsData.length = 0;
  tweetsData.push(...JSON.parse(storedFeed));
  console.log(tweetsData);
}

document.addEventListener("click", function (e) {
  if (e.target.id === "create-btn") {
    createBtnClick();
  } else if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.delete) {
    handleDeleteTweetClick(e.target.dataset.delete);
  }
});

function createBtnClick() {
  const userNameInput = document.getElementById("username");
  const userName = userNameInput.value;

  if (userName.startsWith("@")) {
    alert("Username can't start with '@'");
    return;
  }
  localStorage.setItem("User", userName);
  document.getElementById("modal").style.display = "none";
  document.querySelector("main").setAttribute("tabindex", "-1");
  document.querySelector("main").focus();
  render();
}

function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  render();
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

function handleDeleteTweetClick(tweetId) {
  const tweetIndex = tweetsData.findIndex(function (tweet) {
    return tweet.uuid === tweetId;
  });

  if (tweetIndex !== -1) {
    const tweet = tweetsData[tweetIndex];
    const storedUser = localStorage.getItem("User");

    if (tweet.handle === `@${storedUser}`) {
      tweetsData.splice(tweetIndex, 1);
      localStorage.setItem("FullFeed", JSON.stringify(tweetsData));
      render();
    } else {
      alert("You can only delete your own tweets!");
    }
  }
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");
  let storedUserName = localStorage.getItem("User");
  let newTweet = {
    handle: `@${storedUserName}`,
    profilePic: `images/user.jpg`,
    likes: 0,
    retweets: 0,
    tweetText: tweetInput.value,
    replies: [],
    isLiked: false,
    isRetweeted: false,
    uuid: uuidv4(),
  };
  if (tweetInput.value) {
    tweetsData.unshift(newTweet);
    try {
      localStorage.setItem("FullFeed", JSON.stringify(tweetsData));
    } catch (e) {
      console.error("Local storage unavailable, using session storage");
      sessionStorage.setItem("FullFeed", JSON.stringify(tweetsData));
    }
    render();
    tweetInput.value = "";
  }
}

function getFeedHtml() {
  let feedHtml = ``;

  tweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    if (tweet.isLiked) {
      likeIconClass = "liked";
    }

    let retweetIconClass = "";

    if (tweet.isRetweeted) {
      retweetIconClass = "retweeted";
    }

    let repliesHtml = ``;

    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`;
      });
    }

    feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic" alt="${tweet.handle}'s profile picture">
        
        <div class="tweet-content">
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail" aria-label="${tweet.replies.length} replies">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-trash" aria-label="Delete tweet" data-delete="${tweet.uuid}"
                    ></i>
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}" aria-live="polite">
        ${repliesHtml}
    </div>   
</div>
`;
  });
  let welcomeModalHtml = ``;

  welcomeModalHtml += `
 <div class="modal" id="modal">
    <div class="modal-content">
    <h1 class="modal-title">Welcome to Twitter</h1>
    <label for="username" class="label">Write Your Username</label>
    <input type="text" id="username" name="username" placeholder="elon_musk" required>
    <p>Plz don't start with '@'</p>
    <button class="submit-btn" id="create-btn">Login</button>
    </div>
</div>
 `;

  if (localStorage.getItem("User")) {
    return feedHtml;
  } else {
    return welcomeModalHtml;
  }
}

let resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function () {
  localStorage.clear();
  render();
});

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}
render();

"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${determineStar(story)}
        ${determineTrashandEdit(story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Place solid star if story is a user favorite, outline star otherwise */

function determineStar(story) {
  let userFavoriteIds;
  if (currentUser) {
    userFavoriteIds = currentUser.favorites.map(story => story.storyId);
  }

  let starHtml;
  if (userFavoriteIds && userFavoriteIds.includes(story.storyId)) {
    starHtml = '<i class="fas fa-star"></i>';
  } else {
    starHtml = '<i class="far fa-star"></i>';
  }
  return starHtml;
}

/** Place trash icon and edit button if own story */

function determineTrashandEdit(story) {
  let ownStoryIds;
  if (currentUser) {
    ownStoryIds = currentUser.ownStories.map(story => story.storyId);
  }

  if (ownStoryIds && ownStoryIds.includes(story.storyId)) {
    return `<i class="far fa-trash-alt"></i>
            <button class="edit-btn">Edit</button>`;
  } else {
    return "";
  }
}

/** Put stories on DOM element */
function putStoryListonPage(storyArray, DOMelement) {
  DOMelement.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyArray) {
    const $story = generateStoryMarkup(story);
    DOMelement.append($story);
  }

  DOMelement.show();
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  putStoryListonPage(storyList.stories, $allStoriesList);
}

/** Gets list of user favorites from current user, generates their HTML, and put on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  if (currentUser.favorites.length > 0) {
    putStoryListonPage(currentUser.favorites, $favoritesList); 
  } else {
    $favoritesList.show();
    $favoritesList.text("No favorites added by user yet.")
  }
}

/** Gets list of user stories from current user, generates their HTML, and put on page. */

function putOwnStoriesOnPage() {
  console.debug("putOwnStoriesOnPage");

  console.log(currentUser.ownStories);
  if (currentUser.ownStories.length > 0) {
    putStoryListonPage(currentUser.ownStories, $ownStoriesList); 
  } else {
    $ownStoriesList.show();
    $ownStoriesList.text("No stories added by user yet.")
  }
}

/** Submit a new story to the server and put it on the page. */

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const newStory = {
    title: $("#title-input").val(),
    author: $("#author-input").val(),
    url: $("#url-input").val()
  };

  const story = await storyList.addStory(currentUser, newStory);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $("#title-input").val("");
  $("#author-input").val("");
  $("#url-input").val("");
  $submitStoryForm.hide();
}

$submitStoryForm.on("submit", submitNewStory);

/** Toggle story to being a favorite */

async function toggleFavorite() {
  console.log($(this));
  $(this).toggleClass("fas far");

  const storyId = $(this).parent().attr("id");

  const userFavorites = currentUser.favorites.map(story => story.storyId);

  if (!userFavorites.includes(storyId)) {
    await currentUser.addFavorite(storyId);
  } else {
    await currentUser.removeFavorite(storyId);
  }

  if ($(this).parent().parent().attr("id") === "favorites-list") {
    $(this).parent("li").remove();
    if (currentUser.favorites.length === 0) {
      $favoritesList.text("No stories added by user yet.")
    }
  }
}

$allStoriesList.on("click", ".fa-star", toggleFavorite);
$ownStoriesList.on("click", ".fa-star", toggleFavorite);
$favoritesList.on("click", ".fa-star", toggleFavorite);


/** Remove a story from the server and remove it from the page. */

async function removeStory() {
  const storyId = $(this).parent().attr("id");
  await storyList.removeStory(currentUser, storyId);
  $(this).parent("li").remove();

  if (currentUser.ownStories.length === 0) {
    $ownStoriesList.text("No stories added by user yet.")
  }
}

$allStoriesList.on("click", ".fa-trash-alt", removeStory);
$ownStoriesList.on("click", ".fa-trash-alt", removeStory);
$favoritesList.on("click", ".fa-trash-alt", removeStory);


/** Edit story on the DOM based on form input values. */

function toggleEditStoryForm() {
  const storyId = $(this).parent().attr("id");
  const story = currentUser.ownStories.find((story) => story.storyId === storyId);

  if ($(this).parent().has("form").length === 0) {
    $(this).parent().append(
      `<form id="edit-story-form">
        <div>
          <label for="edit-author-input">author</label>
          <input id="edit-author-input" type="text" placeholder="edited author name" value=${story.author}>
        </div>
        <div>
          <label for="edit-title-input">title</label>
          <input id="edit-title-input" type="text" placeholder="edited story title" value=${story.title}>
        </div>
        <div>
          <label for="edit-url-input">url</label>
          <input id="edit-url-input" type="url" placeholder="edited story url" value=${story.url}>
        </div>
        <button type="submit" id="edit-submit-btn">submit</button>
        <hr>
      </form>`);
  } else {
    $("#edit-story-form").remove();
  }
}

$allStoriesList.on("click", ".edit-btn", toggleEditStoryForm);
$ownStoriesList.on("click", ".edit-btn", toggleEditStoryForm);
$favoritesList.on("click", ".edit-btn", toggleEditStoryForm);

/** Send an edited story to the server and put it on the page. */

async function submitEditedStory() {
  console.debug("submitEditedStory");
  const storyId = $(this).closest("li").attr("id");

  const editedStory = {
    title: $("#edit-title-input").val(),
    author: $("#edit-author-input").val(),
    url: $("#edit-url-input").val()
  };

  await storyList.editStory(currentUser, storyId, editedStory);
  
  console.log(editedStory.url);
  $(this).parent().siblings("a").attr("href", `${editedStory.url}`);
  $(this).parent().siblings("a").text(`${editedStory.title}`);
  $(this).parent().siblings(".story-hostname").text(`(${new URL(editedStory.url).hostname})`);
  $(this).parent().siblings(".story-author").text(`by ${editedStory.author}`);

  $("#edit-story-form").remove();
}

$allStoriesList.on("click", "#edit-submit-btn", submitEditedStory)  
$ownStoriesList.on("click", "#edit-submit-btn", submitEditedStory)  
$favoritesList.on("click", "#edit-submit-btn", submitEditedStory)  

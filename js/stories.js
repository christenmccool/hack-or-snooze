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
        <i class="far fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  let userFavorites;
  if (currentUser) {
    userFavorites = currentUser.favorites.map(story => story.storyId);
  }

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);

    if (userFavorites && userFavorites.includes(story.storyId)) {
      $story.children('i').toggleClass('far fas');
    }

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
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



/** Gets list of user favorites from current user, generates their HTML, and put on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoritesList.empty();

  if (currentUser.favorites) {

    // loop through favorite stories and generate HTML for them
    for (let story of currentUser.favorites) {
      let favstory = new Story(story);
      const $story = generateStoryMarkup(favstory);
      $story.children('i').toggleClass('far fas');
      $favoritesList.append($story);
    }
  } else {
    $favoritesList.text("No favorites added by user yet.")
  }

  $favoritesList.show();
}

/** Gets list of user stories from current user, generates their HTML, and put on page. */

function putOwnStoriesOnPage() {
  console.debug("putOwnStoriesOnPage");

  $ownStoriesList.empty();

  const userFavorites = currentUser.favorites.map(story => story.storyId);

  if (currentUser.ownStories) {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let ownStory = new Story(story);
      const $story = generateStoryMarkup(ownStory);
      $story.prepend('<i class="far fa-trash-alt"></i>');
      $story.children(".fa-star").after('<button class="edit-btn">Edit</button>');

      if (userFavorites && userFavorites.includes(story.storyId)) {
        $story.children('i').toggleClass('far fas');
      }

      $ownStoriesList.append($story);
    }
  } else {
    $ownStoriesList.text("No stories added by user yet.")
  }

  $ownStoriesList.show();
}


$allStoriesList.on("click", ".fa-star", async function () {
  $(this).toggleClass('fas far');

  const storyId = $(this).parent().attr('id');

  const userFavorites = currentUser.favorites.map(story => story.storyId);

  if (!userFavorites.includes(storyId)) {
    await currentUser.addFavorite(storyId);
  } else {
    await currentUser.removeFavorite(storyId);
  }
})


$ownStoriesList.on("click", ".fa-star", async function () {
  $(this).toggleClass('fas far');

  const storyId = $(this).parent().attr('id');

  const userFavorites = currentUser.favorites.map(story => story.storyId);

  if (!userFavorites.includes(storyId)) {
    await currentUser.addFavorite(storyId);
  } else {
    await currentUser.removeFavorite(storyId);
  }
  })

$ownStoriesList.on("click", ".fa-trash-alt", async function () {
  const storyId = $(this).parent().attr('id');
  await storyList.removeStory(currentUser, storyId);
  $(this).parent('li').remove();
}
)

$ownStoriesList.on("click", ".edit-btn", function () {
  const storyId = $(this).parent().attr('id');
  const story = currentUser.ownStories.find((story) => story.storyId === storyId);

  $(this).parent().append(
  `<form id="edit-story-form">
    <div>
      <label for="edit-author-input">author</label>
      <input id="edit-author-input" type="text" placeholder="edited author name">
    </div>
    <div>
      <label for="edit-title-input">title</label>
      <input id="edit-title-input" type="text" placeholder="edited story title">
    </div>
    <div>
      <label for="edit-url-input">url</label>
      <input id="edit-url-input" type="url" placeholder="edited story url">
    </div>
    <button type="submit" id="edit-submit-btn">submit</button>
    <hr>
  </form>`);

  // {/* $editStoryForm.show(); */}
  $("#edit-title-input").val(story.title);
  $("#edit-author-input").val(story.author);
  $("#edit-url-input").val(story.url);
});

async function submitEditedStory() {
  console.debug("submitEditedStory");
  const storyId = $(this).closest('li').attr('id');

  const editedStory = {
    title: $("#edit-title-input").val(),
    author: $("#edit-author-input").val(),
    url: $("#edit-url-input").val()
  };

  await storyList.editStory(currentUser, storyId, editedStory);
  
  console.log(editedStory.url);
  $(this).parent().siblings('a').attr('href', `${editedStory.url}`);
  $(this).parent().siblings('a').text(`${editedStory.title}`);
  $(this).parent().siblings('.story-hostname').text(`(${new URL(editedStory.url).hostname})`);
  $(this).parent().siblings('.story-author').text(`by ${editedStory.author}`);

  $("#edit-story-form").remove();
}

$ownStoriesList.on("click", "#edit-submit-btn", submitEditedStory)



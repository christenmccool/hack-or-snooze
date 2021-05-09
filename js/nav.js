"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show new story submission on click on "submit" */

function navSubmitStory(evt) {
  console.debug("navSubmitStory", evt);
  hidePageComponents();
  $submitStoryForm.show();
  putStoriesOnPage();
}

$body.on("click", "#nav-submit-story", navSubmitStory);

/** Show list of user favorites on click of  "favorites" */

function navFavorites(evt) {
  console.debug("navFavorites", evt);
  hidePageComponents();
  putFavoritesOnPage();
}

$body.on("click", "#nav-favorites", navFavorites);

/** Show list of user stories on click of  "my stories" */

function navOwnStories(evt) {
  console.debug("navOwnStories", evt);
  hidePageComponents();
  putOwnStoriesOnPage()
}

$body.on("click", "#nav-own-stories", navOwnStories);


/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Edli name/password on click on username */

function userProfileClick(evt) {
  console.debug("userProfileClick", evt);
  hidePageComponents();
  $("#edit-name").val(currentUser.name);
  $("#edit-password").val(currentUser.password);
  $userProfileForm.show();
}

$navUserProfile.on("click", userProfileClick);


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

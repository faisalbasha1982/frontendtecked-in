/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the api endpoints service
 *
 * when endpoints return 401 , the page will redirect to login.html
 * @author      TCSCODER
 * @version     1.0
 */

var Api = Api || {};
var BACKEND_HOST = 'https://www.teckedin.com/backend/api/v1';  // backend api endpoint host
// var BACKEND_HOST = 'http://127.0.0.1:3000/api/v1';
var AUTHOBJ_KEY = 'authObj';
var defaultLimit = 50;

var catagoryCache = null;

(function ($) {

  Api.login = login;
  Api.isLoggedIn = isLoggedIn;
  Api.getTechnologyUser = getTechnologyUser;
  Api.searchTechnologyUsers = searchTechnologyUsers;
  Api.updateTechnologyUser = updateTechnologyUser;
  Api.deleteTechnologyUser = deleteTechnologyUser;
  Api.sendMessageTo = sendMessageTo;
  Api.getTechnologyProvider = getTechnologyProvider;
  Api.createSubscribe = createSubscribe;
  Api.getSubscribes = getSubscribes;
  Api.getRequest = getRequest;
  Api.createRequest = createRequest;
  Api.getAppStatistics = getAppStatistics;
  Api.downloadSubscribes = downloadSubscribes;
  Api.downloadRequests = downloadRequests;
  Api.downloadExcels = downloadExcels;
  Api.updateTechnologyProvider = updateTechnologyProvider;
  Api.searchTechnologyProvider = searchTechnologyProvider;
  Api.deleteTechnologyProvider = deleteTechnologyProvider;
  Api.initiateForgotPassword = initiateForgotPassword;
  Api.changeForgotPassword = changeForgotPassword;
  Api.getTechnologyUserStatistics = getTechnologyUserStatistics;
  Api.getgetTechnologyProviderStatistics = getgetTechnologyProviderStatistics;
  Api.getNotifications = getNotifications;
  Api.updateNotifications = updateNotifications;
  Api.logout = logout;
  Api.signup = signup;
  Api.getCurrent = getCurrent;
  Api.getFAQItems = getFAQItems;
  Api.getPostSaves = getPostSaves;
  Api.removeSavePost = removeSavePost;
  Api.getFavouriteCategories = getFavouriteCategories;
  Api.removeFavouriteCategories = removeFavouriteCategories;
  Api.createFavouriteCategories = createFavouriteCategories;
  Api.getFavouriteTechnologyProviders = getFavouriteTechnologyProviders;
  Api.removeFavouriteTechnologyProviders = removeFavouriteTechnologyProviders;
  Api.createFavouriteTechnologyProviders = createFavouriteTechnologyProviders;
  Api.getCategories = getCategories;
  Api.updatePassword = updatePassword;
  Api.uploadImage = uploadImage;
  Api.getPosts = getPosts;
  Api.getPost = getPost;
  Api.removePost = removePost;
  Api.sendPostEmail = sendPostEmail;
  Api.createSavePost = createSavePost;
  Api.createPostViews = createPostViews;
  Api.getPostViews = getPostViews;
  Api.createPost = createPost;
  Api.updatePost = updatePost;
  Api.getCountries = getCountries;
  Api.getStates = getStates;
  Api.getRecommendedContents = getRecommendedContents;
  Api.searchLinkResource = searchLinkResource;
  Api.deleteLinkResource = deleteLinkResource;
  Api.updateLinkResource = updateLinkResource;
  Api.createLinkResource = createLinkResource;
  Api.onWebsiteClick = onWebsiteClick;
  Api.sendVerificationEmail = sendVerificationEmail;
  Api.sendEmail = sendEmail;

  Api.request = request;
  Api.getHeaders = getHeaders;
  Api.BACKEND_HOST = BACKEND_HOST;

  Api.AUTHOBJ_KEY = AUTHOBJ_KEY;
  Api.defaultLimit = defaultLimit;
  Api.needLogin = getToken;
  Api.setCache = setCache;
  Api.getCache = getCache;
  Api.removeCache = removeCache;
  Api.showSuccessToast = showSuccessToast;
  Api.showErrorToast = showErrorToast;
  Api.getErrorMessage = getErrorMessage;
  Api.getQueryString = getQueryString;
  Api.unique = unique;
  Api.getProviderPostHtml = getProviderPostHtml;
  Api.getUserPostItemHtml = getUserPostItemHtml;
  Api.numberToKString = numberToKString;
  Api.fuzzingMatchString = fuzzingMatchString;
  Api.validateEmail = validateEmail;
  Api.validatePhoneNumber = validatePhoneNumber;
  Api.getFileNameByUrl = getFileNameByUrl;
  Api.hideOrShowMoreBtn = hideOrShowMoreBtn;
  Api.updateOffsetAndLimitByAction = updateOffsetAndLimitByAction;
  Api.replaceEnter = replaceEnter;
  Api.getHost = getHost;
  Api.getViews = getViews;
  Api.verifyUserManually = verifyUserManually;

  var storage = window.localStorage;

  /**
   * get token to auth
   * @return {null}
   */
  function getToken() {
    var authObj = getCache(AUTHOBJ_KEY);
    if (!authObj || !authObj.accessToken) {
      window.location.replace('/login.html');
    }
    return authObj.accessToken;
  }

  /**
   * Checks if user is logged in
   * @return {boolean}
   */
  function isLoggedIn() {
    var authObj = getCache(AUTHOBJ_KEY);
    if (!authObj || !authObj.accessToken) {
      return false;
    }
    return true;
  }


  /**
   * get Authorization header
   * @param auth it will add token it auth is true
   */
  function getHeaders(auth, token) {
    var headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'If-Modified-Since': '0' };
    if (auth) {
      headers[ 'Authorization' ] = 'Bearer ' + (token ? token : getToken());
    }
    return headers;
  }

  /**
   * make a request to backend
   * @param type the request method
   * @param path the request path
   * @param headers the request headers
   * @param data data the request data
   * @param scb success callback
   * @param fcb failed callback
   */
  function request(type, path, headers, data, scb, fcb) {

    if (NProgress) NProgress.start();

    $.ajax({
      url: BACKEND_HOST + path,
      async: true,
      success: function (data) {
        if (NProgress) NProgress.done();
        if (scb) scb(data);
      },
      type: type,
      headers: headers,
      data: type.toLowerCase() === 'get' ? data : JSON.stringify(data),
      error: function (xhr, msg, error) {
        if (NProgress) NProgress.done();
        if (xhr.status === 401 || error === 'Unauthorized') {   //when return 401 , goto login page
          removeCache(AUTHOBJ_KEY);
          removeCache('technologyUser');
          removeCache('technologyProvider');
          window.location.replace('/login.html?next=' + encodeURIComponent(window.location.href));
        }
        if (xhr.status >= 200 && xhr.status <= 204) {
          scb({});
        } else {
          if (fcb) {
            fcb(xhr, msg, error);
          }
        }
      },
      dataType: 'json',
    });
  }

  /**
   * user login
   * @param email the user email
   * @param password the user password
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function login(email, password, scb, fcb) {
    request('POST', '/login', getHeaders(), { email: email, password: password }, function (data) {
      setCache(AUTHOBJ_KEY, data);
      scb(data);
    }, fcb);
  }


  /**
   * getCurrent
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getCurrent(scb, fcb) {
    request('GET', '/currentUser', getHeaders(true), {}, function (data) {
      setCache(AUTHOBJ_KEY, data);
      scb(data);
    }, fcb);
  }

  /**
   *  get tech user by id
   * @param id the tech user id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getTechnologyUser(id, scb, fcb) {
    request('GET', '/technologyUsers/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * delete Tech. user
   * @param id the tech user id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function deleteTechnologyUser(id, scb, fcb) {
    request('DELETE', '/technologyUsers/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   *  get tech user by id
   * @param query the search query
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function searchTechnologyUsers(query, scb, fcb) {
    request('GET', '/technologyUsers', getHeaders(true), query, scb, fcb);
  }

  /**
   *  getAppStatistics
   * @param id the tech user id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getAppStatistics(data, scb, fcb) {
    request('GET', '/statistics', getHeaders(true), data, scb, fcb);
  }

  /**
   * update tech user by id and entity
   * @param id the tech user id
   * @param body the tech user body
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updateTechnologyUser(id, body, scb, fcb) {
    request('PUT', '/technologyUsers/' + id, getHeaders(true), body, scb, fcb);
  }

  /**
   * send email or notifications to tech user
   * @param body the send body
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function sendMessageTo(body, scb, fcb) {
    request('POST', '/technologyUsers/messages', getHeaders(true), body, scb, fcb);
  }

  /**
   * send on website click event to backend
   * @param id the provider id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function onWebsiteClick(id, scb, fcb)
  {
    request('POST', '/technologyProviders/' + id + '/onWebsiteClick', getHeaders(true), {}, scb, fcb);
  }

  /**
   * search user link resource
   * @param filter the user filter
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function searchLinkResource(filter, scb, fcb) {
    request('GET', '/linkResources', getHeaders(false), filter, scb, fcb);
  }

  /**
   * send verification code to email box
   * @param email the email address
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function sendVerificationEmail(email, scb, fcb) {
    request('POST', '/sendVerificationEmail?email=' + email, getHeaders(false), {}, scb, fcb);
  }

  /**
   * send email
   * @param body the email body
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function sendEmail(body, scb, fcb) {
    request('POST', '/sendEmail', getHeaders(true), body, scb, fcb);
  }

  /**
   * update link resource
   * @param id the resource id
   * @param entity the the resource entity
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updateLinkResource(id, entity, scb, fcb) {
    request('PUT', '/linkResources/' + id, getHeaders(true), entity, scb, fcb);
  }

  /**
   * create link resource
   * @param entity the resource entity
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createLinkResource(entity, scb, fcb) {
    request('POST', '/linkResources', getHeaders(true), entity, scb, fcb);
  }

  /**
   * delete link resource
   * @param id the resource id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function deleteLinkResource(id, scb, fcb) {
    request('DELETE', '/linkResources/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   *  update tech provider by id and entity
   * @param id the tech provider id
   * @param body the tech provider body
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updateTechnologyProvider(id, body, scb, fcb) {
    request('PUT', '/technologyProviders/' + id, getHeaders(true), body, scb, fcb);
  }

  /**
   * search TechnologyProvider by query
   * @param query the query condition
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function searchTechnologyProvider(query, scb, fcb) {
    request('GET', '/technologyProviders', getHeaders(true), query, scb, fcb);
  }

  /**
   * delete TechnologyProvider
   * @param id the Tech. provider id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function deleteTechnologyProvider(id, scb, fcb) {
    request('DELETE', '/technologyProviders/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   *  get tech Provider by id
   * @param id the provider id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getTechnologyProvider(id, scb, fcb) {
    request('GET', '/technologyProviders/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * subscribe post
   * @param id the post id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createSubscribe(id, scb, fcb) {
    request('POST', '/subscribes', getHeaders(true), { post: id }, scb, fcb);
  }

  /**
   * get subscribes
   * @param data the query search data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getSubscribes(data, scb, fcb) {
    request('GET', '/subscribes', getHeaders(true), data, scb, fcb);
  }

  /**
   * get request
   * @param data the query search data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getRequest(data, scb, fcb) {
    request('GET', '/userRequests', getHeaders(true), data, scb, fcb);
  }

  function downloadExcels(uri, fileName) {
    var req = new XMLHttpRequest();
    req.open("GET", BACKEND_HOST + uri, true);
    req.setRequestHeader('Authorization', 'Bearer ' + getToken());
    req.responseType = "blob";
    req.onload = function (event) {
      var blob = req.response;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) { //for microsoft IE
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else { //other browsers
        var link = document.createElement('a');
        var url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(function () {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    };
    req.send();
  }

  /**
   * download Subscribes
   * @param data the query search data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function downloadSubscribes(data, scb, fcb) {
    downloadExcels('/subscribes/download?provider=' + data.provider,
      'Subscribes-' + new Date().getTime() + '.xlsx');
  }

  /**
   * download request
   * @param data the query search data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function downloadRequests(data, scb, fcb) {
    downloadExcels('/userRequests/download?provider=' + data.provider,
      'Requests-' + new Date().getTime() + '.xlsx');
  }

  /**
   * get Technology User Statistics
   * @param id the tech user id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getTechnologyUserStatistics(id, scb, fcb) {
    request('GET', '/technologyUsers/' + id + '/statistics', getHeaders(true), {}, scb, fcb);
  }

  /**
   * get Technology provider Statistics
   * @param id the provider id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getgetTechnologyProviderStatistics(id, scb, fcb) {
    request('GET', '/technologyProviders/' + id + '/statistics', getHeaders(true), {}, scb, fcb);
  }

  /**
   * get notifications
   * @param data the query data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getNotifications(data, scb, fcb) {
    request('GET', '/notifications', getHeaders(true), data, scb, fcb);
  }

  /**
   * update notification by id
   * @param id the notification id
   * @param data the notification entity
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updateNotifications(id, data, scb, fcb) {
    request('PUT', '/notifications/' + id, getHeaders(true), data, scb, fcb);
  }

  /**
   * logout
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function logout(scb, fcb) {
    request('POST', '/logout', getHeaders(true), {}, scb, fcb);
  }

  /**
   * create new user
   * @param email the email address
   * @param username the user name
   * @param password the password
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function signup(email, username, password, scb, fcb) {
    request('POST', '/signup', getHeaders(), { email: email, username: username, password: password }, scb, fcb);
  }

  /**
   * get faq items
   * @param type the faq type
   * @param offset the offset
   * @param keyword the keyword
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getFAQItems(type, offset, keyword, scb, fcb) {
    const query = { offset: offset, limit: defaultLimit };
    if (keyword && keyword.length > 0) {
      query[ 'keyword' ] = keyword;
    }
    query[ 'types' ] = [ type ];
    request('GET', '/faqItems', getHeaders(), query, scb, fcb);
  }

  /**
   * get post saves
   * @param query the query
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getPostSaves(query, scb, fcb) {
    request('GET', '/postSaves', getHeaders(true), query, scb, fcb);
  }

  /**
   * remove post saves
   * @param id the postsave id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function removeSavePost(id, scb, fcb) {
    request('DELETE', '/postSaves/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * create save post
   * @param data the savePost data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createSavePost(data, scb, fcb) {
    request('POST', '/postSaves', getHeaders(true), data, scb, fcb);
  }

  /**
   * create request
   * @param data the savePost data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createRequest(data, scb, fcb) {
    request('POST', '/userRequests', getHeaders(true), data, scb, fcb);
  }

  /**
   * get FavouriteTechnology Providers
   * @param query the search query
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getFavouriteTechnologyProviders(query, scb, fcb) {
    request('GET', '/favouriteTechnologyProviders', getHeaders(true), query, scb, fcb);
  }

  /**
   * create Favourite TechnologyProvider
   * @param data the Favourite TechnologyProviders object
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createFavouriteTechnologyProviders(data, scb, fcb) {
    request('POST', '/favouriteTechnologyProviders', getHeaders(true), data, scb, fcb);
  }

  /**
   * remove favourite TechnologyProvider
   * @param id the favouriteTechnologyProvider id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function removeFavouriteTechnologyProviders(id, scb, fcb) {
    request('DELETE', '/favouriteTechnologyProviders/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * create Favourite Categorie
   * @param user current user
   * @param category the category id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createFavouriteCategories(user, category, scb, fcb) {
    request('POST', '/favouriteCategories', getHeaders(true), { user: user, category: category }, scb, fcb);
  }

  /**
   * get FavouriteCategories
   * @param query the search query
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getFavouriteCategories(query, scb, fcb) {
    request('GET', '/favouriteCategories', getHeaders(true), query, scb, fcb);
  }

  /**
   * send forgot password to email address
   * @param email the email address
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function initiateForgotPassword(email, scb, fcb) {
    request('POST', '/initiateForgotPassword?email=' + email, getHeaders(false), {}, scb, fcb);
  }

  /**
   * changeForgotPassword with token
   * @param body the changeForgotPassword body
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function changeForgotPassword(body, scb, fcb) {
    request('POST', '/changeForgotPassword', getHeaders(false), body, scb, fcb);
  }

  /**
   * remove FavouriteCategorie by id
   * @param id the FavouriteCategorie id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function removeFavouriteCategories(id, scb, fcb) {
    request('DELETE', '/favouriteCategories/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * get all categories
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getCategories(scb, fcb) {
    if (catagoryCache !== null) {
      scb(catagoryCache);
      return;
    }
    request('GET', '/categories', getHeaders(), {}, function (d) {
      catagoryCache = d;
      scb(d);
    }, fcb);
  }

  /**
   * update password
   * @param oldPassword the old password
   * @param newPassword the new password
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updatePassword(oldPassword, newPassword, scb, fcb) {
    request('PUT', '/updatePassword', getHeaders(true), {
      oldPassword: oldPassword,
      newPassword: newPassword
    }, scb, fcb);
  }

  /**
   * upload image
   * @param url the upload endpoint path
   * @param file the file that need upload
   * @param scb the succeed callback
   * @param fcb the failed callback
   * @param token  the accessToken
   */
  function uploadImage(url, file, scb, fcb, token) {
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
      url: BACKEND_HOST + url,
      type: 'POST',
      data: formData,
      headers: { 'Authorization': 'Bearer ' + (token || getToken()) },
      contentType: false,
      processData: false,
      success: function (args) {
        scb(args);
      }, error: function (err) {
        fcb(err);
      }
    })
  }

  /**
   * get posts
   * @param query the search query
   * @param scb the succeed callback
   * @param fcb the failed callback
   * @param needAuth add token to header if needAuth is true
   */
  function getPosts(query, scb, fcb, needAuth) {
    if (!query.statuses) {
      query.statuses = JSON.stringify([ 'published' ]);
    }
    if (query.sortBy === 'readingTime') {
      query.sortOrder = 'asc';
    }
    request('GET', '/posts', getHeaders(needAuth), query, scb, fcb);
  }

  /**
   * remove posts
   * @param id the post id
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function removePost(id, scb, fcb) {
    request('DELETE', '/posts/' + id, getHeaders(true), {}, scb, fcb);
  }

  /**
   * get single post post
   * @param id  the post id
   * @param scb the succeed callback
   * @param fcb the failed callback
   * @param action the action
   */
  function getPost(id, scb, fcb, action) {
    request('GET', '/posts/' + id + '?action=' + action, getHeaders(), {}, scb, fcb);
  }

  /**
   * send post to email address
   * @param id the post id
   * @param email the mail address
   * @param host the frontend host
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function sendPostEmail(id, email, host, scb, fcb) {
    request('GET', '/posts/' + id + '/email?email=' + email + '&host=' + host, getHeaders(true), {}, scb, fcb);
  }

  /**
   * create post view
   * @param post the post id
   * @param user the tech user
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createPostViews(post, user, scb, fcb) {
    request('POST', '/postViews', getHeaders(true), { post: post, user: user }, scb, fcb);
  }

  /**
   * get post views
   * @param query the search query
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getPostViews(query, scb, fcb) {
    request('GET', '/postViews', getHeaders(true), query, scb, fcb);
  }

  /**
   * create post
   * @param post the post data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function createPost(post, scb, fcb) {
    request('POST', '/posts', getHeaders(true), post, scb, fcb);
  }

  /**
   * update post
   * @param id the post id
   * @param post the post data
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function updatePost(id, post, scb, fcb) {
    request('PUT', '/posts/' + id, getHeaders(true), post, scb, fcb);
  }

  /**
   * get countries
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getCountries(scb, fcb) {
    request('GET', '/countries', getHeaders(), {}, scb, fcb);
  }

  /**
   * get states
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getStates(scb, fcb) {
    request('GET', '/states', getHeaders(), {}, scb, fcb);
  }

  /**
   * get recommended contents
   * @param query the query conditions
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function getRecommendedContents(techUserId, query, scb, fcb) {
    request('GET', '/posts/' + techUserId + '/recommended', getHeaders(true), query, scb, fcb);
  }

  /**
   * Verify a user
   * @param query the query conditions
   * @param scb the succeed callback
   * @param fcb the failed callback
   */
  function verifyUserManually(techUserId, scb, fcb) {
    request('PATCH', '/users/' + techUserId + '/verify', getHeaders(true), {}, scb, fcb);
  }

  /**
   * set cache to local storage
   * @param key
   * @param jsonObj
   */
  function setCache(key, jsonObj) {
    storage.setItem(key, JSON.stringify(jsonObj));
  }

  /**
   * get cache from local storage
   * @param key
   * @return {null}
   */
  function getCache(key) {
    var value = storage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  /**
   * remove cache from local storage
   * @param key
   */
  function removeCache(key) {
    storage.removeItem(key);
  }

  /**
   * show succeed toast on page
   * if you want use the you must import jq.toast.min.js
   * @param message the message content
   */
  function showSuccessToast(message, hideAfter) {
    $.toast({
      heading: 'Success',
      text: message,
      showHideTransition: 'fade',
      icon: 'success',
      closeable: true,
      hideAfter: hideAfter || 3000
    })
  }

  /**
   * show error toast on page
   * @param message
   */
  function showErrorToast(message) {
    $.toast({
      heading: 'Error',
      text: message,
      showHideTransition: 'fade',
      closeable: true,
      icon: 'error'
    })
  }

  /**
   * get error message from backend exception
   * @param err the backend err
   * @return {string}
   */
  function getErrorMessage(err) {
    console.log(err);
    var defaultErrMessage = 'Unknown error, please contact admin for help.';
    if (err && err.responseJSON) {
      const message = err.responseJSON.message || defaultErrMessage;
      if (message instanceof Array) {
        return message[ 0 ].message;
      }
      return message;
    }
    return defaultErrMessage;
  }

  /**
   * get query string from url query
   * @param name the name
   * @return {null}
   */
  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[ 2 ]);
    return null;
  }

  /**
   * make array unique
   * @param arr the array
   */
  function unique(arr) {
    var res = arr.filter(function (item, index, array) {
      return array.indexOf(item) === index;
    });
    return res;
  }

  /**
   * get post item html in provider pages
   * in provider-detail.html
   * in provider-dashboard.html
   * in search_result_provider.html
   *
   * @param post the post entity
   * @param userType the user type
   */
  function getProviderPostHtml(post, userType) {
    var catagoryLink = 'search-result_provider.html?catagory=' + post.category._id;
    var renderDraftLink = function renderDraftLink() {
      if (post.status === 'draft') {
        return '<a class="btn btn-save" href="/create-content.html?id=' + post._id + '">Draft</a>';
      }
      return '';
    };
    var view = post.viewTimes <= 1 ? ' View' : 'Views';
    return '<li class="content-feed-box">' + renderDraftLink() + ('<div class="bg-image"><img src="' + (post.imagePath || './img/thumb-feed-default.jpg') + '" alt="thumbnail" />      </div>      <div class="feed-content"><a href="./content-details_' + userType + '.html?id=' + post._id + '" class="feed-name">' + post.title + '</a><p class="feed-txt">' + post.content.getDescription() + '</p><p class="time-to-read"><span class="time"><span>' + post.readingTime + '</span> min</span> read</p><div class="date-views-row">  <div class="date">    <span class="icons icon-calendar"></span>    <span>' + moment(post.publishedOn).format('ll') + '</span>  </div>  <div class="views">    <span class="icons icon-views"></span>    <span>' + post.viewTimes + ' ' + view + '</span>  </div></div>      </div>      <div class="category-details"><span class="icons icon-category"></span><span>Category :</span><a href="' + catagoryLink + '" class="category-name">' + post.category.name + '</a>      </div>    </li>    ');
  }

  /**
   * get post content html code
   * @param post
   * @return {string}
   */
  function getUserPostItemHtml(post, userType) {
    var catagoryLink = (userType === 'provider' ? 'search-result_provider' : 'all-content') + '.html?catagory=' + post.category._id;
    if (userType === 'not_login') {
      catagoryLink = 'javascript:;';
    }

    var postDetailHtmlName = userType === 'not_login' ? 'content-details_non-logged-in' : userType === 'provider' ? 'content-details_provider' : 'content-details_user';
    var postDetailLink = '/' + postDetailHtmlName + '.html?id=' + post._id;

    var view = post.viewTimes <= 1 ? ' View' : 'Views';

    return '    <li class="content-feed-box" data-id="' + post._id + '">      <span class="reading-time">' + post.readingTime + ' min read</span>      <div class="bg-image"><img src="' + (post.imagePath || './img/thumb-feed-default.jpg') + '" alt="thumbnail"/>      </div>      <div class="feed-content"><a href="' + postDetailLink + '" class="feed-name">' + post.title + '</a><p class="tech-provider-name">' + post.createdBy.name + '</p><p class="feed-txt">  ' + post.content.getDescription() + '</p><div class="date-views-row">  <div class="date">    <span class="icons icon-calendar"></span>    <span>' + moment(post.publishedOn).format('ll') + '</span>  </div>  <div class="views">    <span class="icons icon-views"></span>    <span>' + post.viewTimes + ' ' + view + '</span>  </div></div>      </div>      <div class="category-details"><span class="icons icon-category"></span><span>Category :</span><a href="' + catagoryLink + '" class="category-name">' + post.category.name + '</a>      </div>    </li>';
  }

  /**
   * convert number to K format
   * for example:
   * 11000 = 10.1 K
   * if short is true it will return 10K
   * @param n the number
   * @param short convert to integer if short is true
   * @return {*}
   */
  function numberToKString(n, short) {
    var hours = n / 60;
    if (hours > 1000) {
      return (hours / 1000).toFixed(short ? 0 : 2) + ' K';
    }
    return hours.toFixed(short ? 2 : 2);
  }

  /**
   * fuzzing match string
   * @param source the source string
   * @param dest the dest string
   * @return {boolean}
   */
  function fuzzingMatchString(source, dest) {
    if (!source || !dest) {
      return false;
    }
    return source.toLowerCase().indexOf(dest.toLowerCase()) >= 0;
  }

  /**
   * check email
   * @param email the email address
   */
  function validateEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test(email);
  }

  /**
   * check phone number
   * @param phone the phone number
   */
  function validatePhoneNumber(phone) {
    // var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    // return phone.match(phoneno);
    return true; // let phone number as free
  }

  /**
   * hideOrShow
   */

  function hideOrShowMoreBtn(totalCount, offset, limit, node) {
    if (limit <= 0) {
      node.hide();
    }
    if (totalCount <= offset + limit || limit === 0) {
      node.hide();
    } else {
      node.show();
    }
  }

  /**
   * update offset and limit by action
   * for example, sort need keeped the expand mode
   * @param originOffset the origin offset
   * @param query the query values
   * @param clear need clear offset or limit
   * @param action what trigger content update
   * @return boolean need reset offset to 0 if return true
   */
  function updateOffsetAndLimitByAction(originOffset, query, clear, action) {
    if (action === 'sort') {
      query.limit = originOffset + window.getLimit();
      query.offset = 0;
      return false;
    } else {
      query.offset = clear ? 0 : originOffset;
      query.limit = window.getLimit();
      return true;
    }
  }

  /**
   * get fileName by url
   */
  function getFileNameByUrl(url) {
    var paths = url.split('/');
    return paths[ paths.length - 1 ];
  }

  /**
   * get host
   */
  function getHost() {
    return location.protocol + '//' + location.hostname + ('' + (location.port === "80" ? '' : ':' + location.port));
  }

  function getViews(v) {
    var prefix = (v <= 1) ? ' View' : ' Views'
    return v.toString() + prefix;
  }

  /**
   * replace all \n to <br/>
   */
  function replaceEnter(content) {
    return content ? content.replace(/\n/g, '<br/>') : 'N/A';
  }

  /*Load the scripts which uses authentication dynamically*/
  if(isLoggedIn() && ($(location).attr("href").endsWith('/user_resource.html') || $(location).attr("href").endsWith('/user_news.html'))) {
    let userCommonJs = document.createElement('script');
    userCommonJs.setAttribute('src', 'js/pages/user-common.js');
    userCommonJs.setAttribute('defer', '');
    document.head.appendChild(userCommonJs);
  }

  /*Dynamic Text for News*/
  if(isLoggedIn() && ($(location).attr("href").endsWith('/user_news.html'))) {
    $('.tabs-title>a').text('News');
    $('.tab-heading').text('News');
  } else if(!isLoggedIn() && ($(location).attr("href").endsWith('/user_news.html'))) {
    $('.tabs-title>a').text('Tech News');
    $('.tab-heading').text('Tech News');
  }

  /*Non-Logged in Page Header*/
  const header = '<header class="home-page-header simple-page">' +
      '  <div class="bg-image"></div>' +
      '  <div class="buttons-row-wrapper">' +
      '    <div class="container">' +
      '      <div class="buttons-row">' +
      '        <div class="btn-login-signup">' +
      '          <a href="./home.html" class="btn btn-home sep-line"><span>Home</span></a>' +
      '          <a href="./login.html" class="btn btn-login sep-line"><span>Login</span></a>' +
      '          <a href="./signup.html" class="btn btn-signup"><span>Sign Up</span></a>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  </header>';

  if(!isLoggedIn() && ($(location).attr("href").endsWith('/user_resource.html'))) {
    $('#page-home').html(header);
  } else if(!isLoggedIn() && ($(location).attr("href").endsWith('/user_news.html'))) {
    $('#page-home').html(header);
  }
})($);

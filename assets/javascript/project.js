$(document).ready(function() {

  $("#flip").on("click", function() {

    $('.ui.sidebar').sidebar('toggle');
  });

  $('.ui.accordion').accordion();


  $('.ui.sidebar.inverted.vertical.menu').sidebar({
    transition: 'overlay'
  });

  $('.ui.radio.checkbox').checkbox();

  $('#getNews').on('click', function() {
    $('.basic.modal.nyTime').modal('show');
  });

  $('#getBooks').on('click', function() {
    $('.basic.modal.books').modal('show');
  });

  $('#getPodcasts').on('click', function() {
    $('.basic.modal.podcast').modal('show');
  });

  $('#getMeetUp').on('click', function() {
    $('.basic.modal.meetup').modal('show');
  });

  //Firebase initialize
  var config = {
    apiKey: "AIzaSyDxW087mUoLk6smGAHixRd5lLKYBZ4JeA8",
    authDomain: "first-project-5b478.firebaseapp.com",
    databaseURL: "https://first-project-5b478.firebaseio.com",
    projectId: "first-project-5b478",
    storageBucket: "",
    messagingSenderId: "618602692351"
  };

  firebase.initializeApp(config);

  //store firebase db and auth in global variables
  var database = firebase.database();
  var auth = firebase.auth();
  var name = "";
  var email = "";
  var password = "";
  var interest = "";
  var datatopic = "";

  //
  //creates user -- signup email authentication
  $("#signup").on("click", function() {
    window.location.href = "signup.html";
  });

  $("#signUpSubmit").on("click", function(event) {
    event.preventDefault();

    name = $("#signUpName").val().trim();
    email = $("#signUpEmail").val().trim();
    password = $("#signUpPassword").val().trim();

    var newuser = auth.createUserWithEmailAndPassword(email, password);

    newuser.then(function(user) {
      var ref = database.ref("/user/" + user.uid);

      ref.set({
        userName: name,
        email: email,
        uid: user.uid,
        interest: false
      })

    }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    });

    $("#signUpName").val("");
    $("#signUpName").val("");
    $("#signUpName").val("");

    auth.signOut();
    setTimeout(function() {
      window.location.href = "login.html";
    }, 2000);

  });

  //user login
  $("#login").on("click", function() {
    window.location.href = "login.html";
  });

  $("#signUpLink").on("click", function() {
    window.location.href = "signup.html";
  });

  $("#loginSubmit").on("click", function(event) {
    event.preventDefault();

    email = $("#loginEmail").val().trim();
    password = $("#loginPassword").val().trim();

    var loginuser = auth.signInWithEmailAndPassword(email, password);

    loginuser.then(function() {
      $("#loginEmail").val("");
      $("#loginPassword").val("");
      window.location.href = 'main.html';

    }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    })
  });

  getContent();

  $("#logout").on("click", function() {

    var logoutuser = auth.signOut();

    logoutuser.then(function() {

      window.location.href = "index.html";

    }).catch(function(error) {

      console.log(error.code);
      console.log(error.message);
    });
  });

  function getContent() {

    auth.onAuthStateChanged(function(user) {

      if (user) {
        var ref = database.ref("/user/" + user.uid);

        ref.once("value", function(snapshot) {

          var datatopic = snapshot.val().interest;
          $("#userName").text("Welcome back " + snapshot.val().userName);

          if (datatopic === false) {
            setFavoriteTopic();

          } else {
            getYouTube(datatopic);
            getBooks(datatopic);
            getNews(datatopic);
            getPodcasts(datatopic);
            getMeetup(datatopic);
            getTwitter(datatopic);
            getSavedYouTubeFromDatabase();
            getSavedPodcastFromDatabase();
            getSavedBooksFromDatabase();
            getSavedMeetupFromDatabase()
            getBackgroundImage(datatopic);
          }

        });
      } else {
        $("#userName").html("<a style='color: black;' href='login.html'>Sign In</a>");
      }
    });
  };

  //Add Favorite Interest for New User and change user settings for interest - password - email
  function setFavoriteTopic() {
    $('.basic.modal.setting').modal('show');
    $('#newUserModal').show();
    $('.userSettings').hide();
    $('#changePasswordForm').hide();
    $('#changeEmailForm').hide();
    changeInterest();
  };
  //Change User Settings (Favorite Interest, Password, Email Address)
  $('.icon.button').on('click', function() {
    $('.basic.modal.setting').modal('show');
    $('#newUserModal').hide();
    $('.userSettings').show();
    $('#changePasswordForm').hide();
    $('#changeEmailForm').hide();
    changeInterest();
  });

  function changeInterest() {
    $("#newInterestSubmit").on("click", function() {
      var interest = $("#newInterestInput").val().trim();
      var user = auth.currentUser;
      var ref = database.ref("/user/" + user.uid);
      ref.update({
        interest: interest,
      });
      $("#newInterestInput").val("");
      $('.basic.modal.setting').modal('hide');
      setTimeout(function() {
        getContent();
      }, 2000);
    });
  };
  //Change Password in Settings
  $("#changePassword").on("click", function() {
    $("#changePasswordForm").show();
  });

  $("#changePasswordSubmit").on("click", function(event) {
    event.preventDefault();
    var emailAddress = $("#changePasswordInput").val().trim();
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      $("#emailSentConfirm").html("A password reset email has been sent to " + emailAddress);

    }, function(error) {
      $("#emailSentConfirm").html(error);
    });
    $("#changePasswordInput").val("");
  });

  $("#changeEmail").on("click", function() {
    $("#changeEmailForm").show();
  });
  //Change Email in Settings
  $("#changeEmailSubmit").on("click", function(event) {
    event.preventDefault();

    var emailAddress = $("#changeEmailInput").val().trim();

    var user = auth.currentUser;
    user.updateEmail(emailAddress).then(function() {
      $("#emailSentConfirm").html("Your user email has been changed to " + emailAddress);
      var ref = database.ref("/user/" + user.uid);
      ref.update({
        email: emailAddress
      });

      setTimeout(function() {
        auth.signOut();
        window.location.href = "login.html";
      }, 2000);

    }, function(error) {
      $("#emailSentConfirm").html(error);
    });
    $("#changeEmailInput").val("");
  });

  //Search topic to populate APIs
  $("#searchSubmit").on("click", function(event) {
    event.preventDefault();

    datatopic = $("#searchInput").val().trim();

    getYouTube(datatopic);
    getBooks(datatopic);
    getNews(datatopic);
    getPodcasts(datatopic);
    getMeetup(datatopic);
    getTwitter(datatopic);
    getBackgroundImage(datatopic);
    $("#searchInput").val("");
  });
  //background image
  function getBackgroundImage(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    var apiKey = "da529368443c37716713225f589d09c8916dad8c65611db1bed24204e6cf982d";
    var queryURL = "https://api.unsplash.com/photos/random?query=" + searchTopic + "&orientation=landscape&count=1&w=1280&h=800";

    $.ajax({
        method: 'GET',
        url: queryURL,
        headers: {
          "Accept-Version": "v1",
          "Authorization": "Client-ID da529368443c37716713225f589d09c8916dad8c65611db1bed24204e6cf982d"
        }
      })
      .done(function(response) {
        var randomBackground = response[0].urls.custom;
        $('body.pushable>.pusher').css({
          'background': 'url(' + randomBackground + ') fixed',
          'background-size': 'cover',
          'padding': '0',
          'margin': '0'
        })

        var user = response[0].user.name;
        var userLink = response[0].user.links.html;
        var creditDiv = $("<div id='photoCredit'>");
        var userInfo = "<a target='_blank' href=" + userLink + "?utm_source=mybentohub&utm_medium=referral&utm_campaign=api-credit>" + user + "</a>";
        var unsplashURL = "<a target='_blank' href='https://unsplash.com/?utm_source=mybentohub&utm_medium=referral&utm_campaign=api-credit'>Unsplash</a>";
        creditDiv.html("Photographer:" + userInfo + " / " + unsplashURL);
        creditDiv.css({
          "position": "relative",
          "bottom": "10px",
          "right": "-20px"
        })
        $('body.pushable>.pusher').append(creditDiv);

      }).fail(function(error) {
        $('body.pushable>.pusher').css({
          'background': 'url(http://wallpapercave.com/wp/n0FcaBH.jpg) fixed',
          'background-size': 'cover',
          'padding': '0',
          'margin': '0'
        });
        console.log(error);
      });
  };

  $("#Bento-Logo").on('click', function() {
    $(".sourceCards").toggle('slow');
  });

  function getYouTube(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");

    // NEW VARIABLE TO set search to begin 30 days ago from current time
    // USING MOMENT.JS
    var searchBeginingDate = moment().subtract(30, 'days').toISOString();
    // the youtube query url requires "publishedAfter" to be a string
    var publishedAfter = String(searchBeginingDate);
    // ===============================================================
    // var order = 'date';
    var videoID;
    // =======PREVIOUS URL BEFORE MAURICIO'S MOMENT.JS DATE TEST.======
    // var queryURL = 'https://www.googleapis.com/youtube/v3/search?maxResults=9&part=snippet&&relevanceLanguage=en&q=' + searchTopic + '&order=' + order + '&order=viewCount&type=video&videoEmbeddable=true&key=AIzaSyCnbcvaas-tjIurM5-936c9S3mT5dJgTIo';
    // =====================================================================
    // =TESTING NEW QUERY URL TO GRAB VIDEOS FROM 30 DAYS AGO WITH MOST viewCountS

    var queryURL = 'https://www.googleapis.com/youtube/v3/search?maxResults=9&part=snippet&&relevanceLanguage=en&q=' +
      searchTopic + '&publishedAfter=' + publishedAfter +
      '&type=video&videoEmbeddable=true&key=AIzaSyCnbcvaas-tjIurM5-936c9S3mT5dJgTIo';

    $.ajax({
        url: queryURL,
        method: 'GET',
        dataType: 'jsonp'
      })

      .done(function(response) {

        $("#video-div").empty();

        for (var i = 0; i < response.items.length; i++) {
          var ytHoldDiv = $("<div>");
          var youtubeDiv = $("<iframe class='youtube' allowfullscreen>");
          youtubeDiv.css({
            "width": "250px",
            "height": "160px",
            "display": "block",
            "padding": "10px"
          });

          var videoIdList = response.items[i].id.videoId;
          var url = 'https://www.youtube.com/embed/' + videoIdList;

          // grabbing the title for every video
          var videoTitle = response.items[i].snippet.title;

          var saveIcon = $("<i>");

          saveIcon.addClass("plus square outline icon green inverted ytSaveIcon");
          saveIcon.attr("data-saved", "false");
          saveIcon.css({
            "padding": "0px",
            "margin-left": "8px"
          });

          saveIcon.attr("data-ytUrl", url).attr("data-ytTitle", videoTitle);

          youtubeDiv.attr("src", url);
          youtubeDiv.addClass("margin-top");
          ytHoldDiv.append(youtubeDiv);
          ytHoldDiv.append(saveIcon);
          $("#video-div").append(ytHoldDiv);
          $('#ytThumbnail').on('click', function() {
            $('.basic.modal.yt')
              .modal('show');
          });
        }

        $("#ytThumbnail").empty();

        // APPENDING thumbnails TO youtube DIV

        for (var i = 0; i < response.items.length; i++) {
          var ytHoldDiv = $("<div class=thumbnails>");
          var ytThumbNailUrl = response.items[i].snippet.thumbnails.default.url;
          var ytThumbnailHolder = $("<img>").attr("src", ytThumbNailUrl);
          ytThumbnailHolder.css({
            "height": "75px",
            "width": "90px",
          })
          ytHoldDiv.css({
            "display": "flex",
            "flex-flow": "column-wrap",
            "justify-content": "center",
            "float": "left",
            // "padding" : "1px",
            "width": "33.33%",
            // "border" : "1px solid black",
            "background-color": "black",
            "border-radius": "10px",
          })

          ytHoldDiv.append(ytThumbnailHolder);
          $("#ytThumbnail").append(ytHoldDiv);
        }
      }).fail(function(err) {
        console.log(err.statusText);
      })
  };

  function getBooks(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    var GbooksAPIkey = "AIzaSyAdRit-J3O3HY3ojccN4WDrf1Zqa-mVcgw"
    var queryURL = "https://www.googleapis.com/books/v1/volumes?q=" + searchTopic + "&langRestrict=en&maxResults=15&orderBy=newest&key=" + GbooksAPIkey;

    $.ajax({
        url: queryURL,
        method: 'GET',
      })
      .done(function(response) {

        $("#books-div").empty();
        $("#booksIntro").empty();

        var arr = response.items;
        for (var i = 0; i < arr.length; i++) {
          var booksRow = $('<div>').attr('class', 'booksContainer');
          var thumbnailsSource = arr[i].volumeInfo.imageLinks.smallThumbnail;
          var thumbnails = $('<img>').attr('src', thumbnailsSource).attr('class', 'bookImage');

          bookLink = $('<a>').attr({
            'class': 'podlink',
            'href': arr[i].volumeInfo.infoLink,
            'target': '_blank'
          });
          bookLink.append(thumbnails);

          bookTitle = $('<p>').attr('class', 'bookTitle');
          var saveButton = $("<i class='green plus icon booksSaveIcon'><i>");
          saveButton.attr({
            "data-image": thumbnailsSource,
            "data-booksUrl": arr[i].volumeInfo.infoLink,
            "data-title": arr[i].volumeInfo.title,
            "data-saved": "false"
          })
          bookTitle.html(arr[i].volumeInfo.title);

          booksRow.append(bookLink, saveButton);
          $("#books-div").append(booksRow);

          $('.booksContainer').css({
            'width': '5%',
            'margin-bottom': '30px',
            'margin-right': '0px',
            'float': 'left'
          });

          $(thumbnails).css({
            'margin-top': '20px',
            'float': 'left'
          });
        };

        var introBookThumbnail = arr[0].volumeInfo.imageLinks.smallThumbnail;
        var introBookDiv = $("<div>");
        introBookDiv.css({
          "display": "inline-block",
          "margin-right": "10px",
          "display": "flex",
          "justify-content": "center"
        });
        var introBookImage = $("<img>");
        introBookImage.attr("src", introBookThumbnail);

        introBookDiv.append(introBookImage);

        $("#booksIntro").append(introBookDiv);

      }).fail(function(err) {
        console.log(err.statusText);
      });
  };

  function getNews(datatopic) {

    var searchTopic = datatopic.split(" ").join("+");
    var endpoint = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + searchTopic + '&sort=newest&begin_date=20170000&hl=true&api_key=a49e8a22035943e9bb2f4928fe15d8fe';

    $.ajax({
        url: endpoint,
        method: 'GET'
      }).then(function(data) {

        $("#nyTime-div").empty();

        var arr = data.response.docs;
        for (var i = 0; i < arr.length; i++) {
          var content = $("<div>").attr('class', 'nyTimeBox');
          var source = $("<p>").attr('class', 'source'),
              headline = $("<h5>").attr('class', 'headline'),
              snippet = $("<p>").attr('class', 'snippet'),
              date = $("<p>").attr('class', 'date'),
              web = $("<a>").attr({
              'class': 'link',
              'href': arr[i].web_url,
              'target':'_blank'
            });
              $('.nyTimeBox').css({
            'border':'1px outset white',
            'border-radius': '10px',
            'background-color':'white',
            'padding': '2%',
            'color': 'black',
            'margin-bottom':'10px',
            'margin-top':'0px',
            'box-shadow':'3px 3px 5px black',
            'color':'black'
            });
           //    $('#nyTime-div').css({
           // 'background-color':'black'
           //    });

            headline.html(arr[i].headline.main);
            source.html("Source : " + arr[i].source);
            snippet.html("' " + arr[i].snippet + " '");
            date.html(arr[i].pub_date);
            web.html("Read More >>") + arr[i].web_url;
            content.append(source, date, headline, snippet, web);
            $("#nyTime-div").append(content);
        }
        $("#nyTimeIntro").empty();
        for (var i = 0; i < 1; i++) {
          var content = $("<div>").attr('class', 'nyTimeBox');
          var snippet = $("<h6>").attr('class', 'snippet'),
            headline = $("<h5>").attr('class', 'headline'),
            date = $("<p>").attr('class', 'date');
          web = $("<a>").attr({
              'class': 'link',
              'href': arr[i].web_url,
               'target':'_blank'
            }),

          headline.html(arr[i].headline.main);
          snippet.html("' " + arr[i].snippet + " '");
          date.html(arr[i].pub_date);
          web.html("Read More >>") + arr[i].web_url;
          content.append(date, headline, snippet, web);
          $("#nyTimeIntro").append(content);
        }
      })

      .catch(function(err) {
        console.log(err.statusText);
      });

  };

  function getPodcasts(datatopic) {
    var searchTopic = datatopic.split(" ").join("%20");
    var queryURL = 'https://api.ottoradio.com/v1/podcasts?query=' + searchTopic + '&type=recent&count=20';

    $.ajax({
        url: queryURL,
        method: 'GET',
      })
      .done(function(response) {

        $("#pod-div").empty();
        $("#pod-nowPlaying").empty();
        $("#audioPlayer").empty();

        for (var i = 0; i < response.length; i++) {

          var podDiv = $("<div>");
          var podTitle = $("<p>" + response[i].title + "</p>");
          var podSource = $("<p>" + response[i].source + "</p>");
          var podDate = $("<p>" + response[i].published_at + "</p>");

          podDiv.css({
            "width": "315px",
            "height": "160px",
            "float": "left",
            "margin": "10px 50px 20px 50px",
          });

          var podPlayIcon = $("<i>");
          podPlayIcon.addClass("play icon green clickPlay");
          podPlayIcon.attr("data-src", response[i].audio_url).attr("data-podTitle", response[i].title);

          var podSaveIcon = $("<i>");
          podSaveIcon.addClass("plus square outline icon green inverted podSaveIcon");

          podSaveIcon.attr({
            "data-podUrl": response[i].audio_url,
            "data-podTitle": response[i].title,
            "data-saved": "false"
          });

          podDiv.append(podPlayIcon);
          podDiv.append(podTitle);
          podDiv.append(podSource, podDate, podSaveIcon);

          $("#pod-div").append(podDiv);
        };
        var audioControl = $("<audio controls>");
        var audioSource = $("<source>");
        var randomPodcast = Math.floor(Math.random() * response.length);
        var podCounts = response.length - 1;
        audioSource.attr("src", response[randomPodcast].audio_url).attr("type", "audio/mpeg");
        audioControl.append(audioSource);

        $("#pod-nowPlaying").html("Listen to " + response[randomPodcast].title + " or click above for " + podCounts + " more podcasts.");
        $("#audioPlayer").append(audioControl);

      }).fail(function(err) {
        console.log(err.statusText);
      });
  };

  function getMeetup(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    $.ajax({

        url: 'https://api.meetup.com/find/groups?page=20&text=' + searchTopic + '&key=4f2661595c402d1f6c515a3b671056',
        method: "GET",
        dataType: "jsonp"
      })
      .then(function(data) {

        $("#meetup-div").empty();
        $("#meetupIntro").empty();

        var arr = data.data; // array of 10 objects
        for (var i = 0; i < arr.length; i++) {
          var meetupInfoDiv = $("<div>").attr('class', 'meetupDiv');
          var city = $("<h3>").attr('class', 'cityMeetupContent'),
            description = $("<p>").attr('class', 'meetupDescribe'),
            link = $("<a>").attr({
              'class': 'linkMeetupContent',
              'href': arr[i].link,
              'target': '_blank'
            }),
            name = $("<h2>").attr('class', 'meetupName');

          city.html(arr[i].city + " (" + arr[i].members + " Members)");
          description.html("Description : " + "<br></br>" + arr[i].description);
          link.html(arr[i].link);
          name.html(arr[i].name);


          var meetupSaveIcon = $("<i>");
          meetupSaveIcon.addClass("plus square outline icon green inverted meetupSaveIcon");
          meetupSaveIcon.attr({
            "data-city": arr[i].city,
            "data-meetupGroup": arr[i].name,
            "data-meetupUrl": arr[i].link,
            "data-memberCount": arr[i].members,
            "data-saved": "false"
          });

          meetupInfoDiv.append(meetupSaveIcon, name, city, link, description);

          $("#meetup-div").append(meetupInfoDiv);

        }
        $("#meetupIntro").html("'Click below for more info on " + arr.length + " Meetup groups in " + datatopic + " category'")
      })
      .catch(function(err) {
        console.log(err.statusText);
      })
  };

  function getTwitter(datatopic) {
    $("#twitterEmbed").empty();
    var searchTopic = datatopic.split(" ").join("");
    var queryURL = 'https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2F' + searchTopic + '&maxheight=500';
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "jsonp"
      })
      .then(function(data) {

        $("#twitterEmbed").append(data.html);
      })
      .fail(function(err) {
        console.log(err.statusText);
      })
  };

  //Saving - Displaying - Deleting Saved Items
  //YouTube Saves
  $(document).on("click", ".ytSaveIcon", function() {
    var ytUrl = $(this).attr("data-ytUrl");
    var ytTitle = $(this).attr("data-ytTitle");
    $(this).removeClass("plus green square");
    $(this).addClass("red pin");

    dataSaved = $(this).attr("data-saved");

    if (dataSaved !== "true") {
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.push({
      ytUrl: ytUrl,
      ytTitle: ytTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedYouTubeFromDatabase();
    $(this).attr("data-saved", "true");
  } else {
    //Already Saved
    }
  });

  function getSavedYouTubeFromDatabase() {
    $("#ytSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var ytSavedUrl = childSnapshot.val().ytUrl;
        var ytSavedDiv = $("<div>");
        ytSavedDiv.css("margin-top", "20px");
        var iFrameSaved = $("<iframe class='youtube' allowfullscreen>");
        iFrameSaved.css({
          "width": "150px",
          "height": "80px",
          "display": "block",
        });
        iFrameSaved.attr("src", ytSavedUrl);
        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        ytSavedDiv.append(deleteIcon);
        ytSavedDiv.append(iFrameSaved);

        $("#ytSavedItems").prepend(ytSavedDiv);

      });
    });
  };

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.child(itemKey).remove();
    getSavedYouTubeFromDatabase();
  });

  //Podcast Saves
  $(document).on("click", ".podSaveIcon", function() {
    var podUrl = $(this).attr("data-podUrl");
    var podTitle = $(this).attr("data-podTitle");
    $(this).removeClass("plus green square");
    $(this).addClass("red pin");
    var dataSaved = $(this).attr("data-saved");

    if (dataSaved !== "true") {
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.push({
      podUrl: podUrl,
      podTitle: podTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedPodcastFromDatabase();
    $(this).attr("data-saved", "true");
  } else {
    //Already Saved
  }
  });

  function getSavedPodcastFromDatabase() {
    $("#podSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var podSavedTitle = childSnapshot.val().podTitle;
        var podSavedUrl = childSnapshot.val().podUrl;
        var podSavedDiv = $("<div>").attr("class", "podDiv")
        var podTitle = $("<p>" + podSavedTitle + "</p>");

        podSavedDiv.css("margin-top", "15px");

        var podPlayIcon = $("<i>");
        podPlayIcon.addClass("play icon green clickPlay");
        podPlayIcon.attr("data-src", podSavedUrl).attr("data-podTitle", podSavedTitle);
        podTitle.css({
          "width": "100px",
          "display": "inline",
          "margin-left": "5px",
          "font-size": "10px"
        });

        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        podSavedDiv.append(podPlayIcon);
        podSavedDiv.append(deleteIcon);
        podSavedDiv.append(podTitle);

        $("#podSavedItems").prepend(podSavedDiv);

      });
    });
  };

  $(document).on("click", ".clickPlay", function() {
    $("#audioPlayer").empty();
    var podURL = $(this).attr("data-src");
    var podTitle = $(this).attr("data-podTitle");
    var audioControl = $("<audio controls autoplay>");
    var audioSource = $("<source>");

    $("#pod-nowPlaying").html("You are listening to " + podTitle);

    audioSource.attr("src", podURL).attr("type", "audio/mpeg");
    audioControl.append(audioSource);

    $("#audioPlayer").append(audioControl);
  });

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.child(itemKey).remove();
    getSavedPodcastFromDatabase();
  });

  //Book Saves
  $(document).on("click", ".booksSaveIcon", function() {
    var booksImage = $(this).attr("data-image");
    var booksUrl = $(this).attr("data-booksUrl");
    var booksTitle = $(this).attr("data-title");
    $(this).removeClass("plus green square");
    $(this).addClass("red pin");
    var dataSaved = $(this).attr("data-saved");

    if (dataSaved !== "true") {
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.push({
      booksImage: booksImage,
      booksUrl: booksUrl,
      booksTitle: booksTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedBooksFromDatabase();
    $(this).attr("data-saved", "true");
  } else {
    //Already Saved
  }
  });

  function getSavedBooksFromDatabase() {
    $("#booksSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var booksSavedImage = childSnapshot.val().booksImage;
        var booksSavedUrl = childSnapshot.val().booksUrl;
        var booksSavedTitle = childSnapshot.val().booksTitle;
        var booksSavedDiv = $("<div>");
        booksSavedDiv.css("margin-top", "20px");
        var booksTitle = $("<div>");
        booksTitle.append(booksSavedTitle);
        booksTitle.css({
          "width": "100px",
          "display": "inline-block",
          "font-size": "10px",
          // "word-break" : "break-all"
        })

        var booksThumbnail = $("<img>");
        booksThumbnail.attr("src", booksSavedImage);
        booksThumbnail.css({
          "height": "100px",
          "width": "auto",
          "margin": "0 5px 5px 0",
        });

        var booksSavedLink = $("<a>").attr({
          'class': 'booklink',
          'href': booksSavedUrl,
          'target': '_blank'
        });

        booksSavedLink.append(booksThumbnail);

        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        booksSavedDiv.append(booksSavedLink);
        booksSavedDiv.append(deleteIcon);
        booksSavedDiv.append(booksTitle);

        $("#booksSavedItems").prepend(booksSavedDiv);

      });
    });
  };

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.child(itemKey).remove();
    getSavedBooksFromDatabase();
  });

  //Meetup Saves
  $(document).on("click", ".meetupSaveIcon", function() {
    $(this).removeClass("plus green square");
    $(this).addClass("red pin");
    var meetupCity = $(this).attr("data-city");
    var meetupGroup = $(this).attr("data-meetupGroup");
    var meetupUrl = $(this).attr("data-meetupUrl");
    var memberCount = $(this).attr("data-memberCount");
    var dataSaved = $(this).attr("data-saved");

    if (dataSaved !== "true") {
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/meetupSaved");
    ref.push({
      meetupCity: meetupCity,
      meetupName: meetupGroup,
      meetupUrl: meetupUrl,
      memberCount: memberCount,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedMeetupFromDatabase();
     $(this).attr("data-saved", "true");
  } else {
    //Already Saved
  }
  });

  function getSavedMeetupFromDatabase() {
    $("#meetupSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/meetupSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var meetupSavedName = childSnapshot.val().meetupName;
        var meetupSavedCity = childSnapshot.val().meetupCity;
        var meetupSavedUrl = childSnapshot.val().meetupUrl;
        var meetupSavedMembers = childSnapshot.val().memberCount;
        var meetupSavedDiv = $("<div>");
        meetupSavedDiv.css({
          "margin-top": "20px",
          // "border":"1px solid grey",
          "border-radius": "10px",
          "padding": "20px",
          // "background-image":"url('assets/images/pantoneCut.jpg')",
          // "background-size":"cover",
          "box-shadow": "2px 3px 15px grey",
          "background-color": "black"

        });

        var meetupLink = $("<a>").attr({
          'class': 'meetuplink',
          'href': meetupSavedUrl,
          'target': '_blank'
        });
        $('.meetuplink').css({
          'word-break':'break-all'
        });


        var meetupGroupName = $("<p>Group: " + "<br></br>" + meetupSavedName + "</p>");
        var meetupCity = $("<p>City: " + meetupSavedCity + " (" + meetupSavedMembers + " Members)</p>");
        meetupLink.html(meetupSavedUrl);

        meetupGroupName.css("font-size", "12px");
        meetupCity.css("font-size", "12px");
        meetupLink.css("font-size", "12px");

        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        meetupSavedDiv.append(deleteIcon);
        meetupSavedDiv.append(meetupGroupName);
        meetupSavedDiv.append(meetupCity);
        meetupSavedDiv.append(meetupLink);

        $("#meetupSavedItems").prepend(meetupSavedDiv);

      });
    });
  };

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/meetupSaved");
    ref.child(itemKey).remove();
    getSavedMeetupFromDatabase();
  });
});
//document end.

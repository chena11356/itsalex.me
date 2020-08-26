(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#sideNav'
  });

})(jQuery); // End of use strict

$(function () {
  $('[data-toggle="popover"]').popover()
})

$('.popover-dismiss').popover({
  trigger: 'focus'
})

$('[data-toggle="popover"]').popover({
    container: 'body'
});

$('#videoLinkPolice').click(function () {
  var src = 'https://www.youtube.com/embed/B5bzWKs7SQg?start=281';
  $('#myModal').modal('show');
  $('#myModal iframe').attr('src', src);
});

$('#myModal button').click(function () {
  $('#myModal iframe').removeAttr('src');
});

// Only display certain resume items, based on filters
var filters = {
  highlights: true, 
  govt: false, 
  tech: false, 
  pm: false, 
  front: false, 
  back: false, 
  abm: false, 
  community: false, 
  teaching: false, 
  research: false
};

var exp_items = document.getElementsByClassName("exp");
var cur_exp_item;
var cur_class_list;
var ind; 
var new_class_list;

function update_exp_items() {
  // Iterate through all the exp_items and determine whether to display
  for (var i = 0; i < exp_items.length; i++) {
    cur_exp_item = exp_items[i];
    cur_class_list = cur_exp_item.className.split(' ');
    if (
      (filters.highlights && cur_class_list.includes("tag-highlights")) ||
      (filters.govt && cur_class_list.includes("tag-govt")) ||
      (filters.tech && cur_class_list.includes("tag-tech")) ||
      (filters.pm && cur_class_list.includes("tag-pm")) ||
      (filters.front && cur_class_list.includes("tag-front")) ||
      (filters.back && cur_class_list.includes("tag-back")) ||
      (filters.abm && cur_class_list.includes("tag-abm")) ||
      (filters.community && cur_class_list.includes("tag-community")) ||
      (filters.teaching && cur_class_list.includes("tag-teaching")) ||
      (filters.research && cur_class_list.includes("tag-research"))
    ) {
      // Remove any d-flex and d-none from cur_class_list, and add d-flex
      ind = cur_class_list.indexOf("d-none");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-none");
      }
      ind = cur_class_list.indexOf("d-flex");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-flex");
      }
      cur_class_list.push("d-flex");
    } else {
      // Remove any d-flex and d-none from cur_class_list, and add d-none
      ind = cur_class_list.indexOf("d-none");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-none");
      }
      ind = cur_class_list.indexOf("d-flex");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-flex");
      }
      cur_class_list.push("d-none");
    }
    new_class_list = ""; 
    for (var j = 0; j < cur_class_list.length; j++) {
      new_class_list += cur_class_list[j] + " ";
    }
    new_class_list = new_class_list.substring(0, new_class_list.length - 1);
    document.getElementById(cur_exp_item.id).className = new_class_list;
  }
}

update_exp_items();

var proj_items = document.getElementsByClassName("proj");
var cur_proj_item;
var cur_class_list;
var ind; 
var new_class_list;

function update_proj_items() {
  // Iterate through all the proj_items and determine whether to display
  for (var i = 0; i < proj_items.length; i++) {
    cur_proj_item = proj_items[i];
    cur_class_list = cur_proj_item.className.split(' ');
    if (
      (filters.highlights && cur_class_list.includes("tag-highlights")) ||
      (filters.govt && cur_class_list.includes("tag-govt")) ||
      (filters.tech && cur_class_list.includes("tag-tech")) ||
      (filters.pm && cur_class_list.includes("tag-pm")) ||
      (filters.front && cur_class_list.includes("tag-front")) ||
      (filters.back && cur_class_list.includes("tag-back")) ||
      (filters.abm && cur_class_list.includes("tag-abm")) ||
      (filters.community && cur_class_list.includes("tag-community")) ||
      (filters.teaching && cur_class_list.includes("tag-teaching")) ||
      (filters.research && cur_class_list.includes("tag-research"))
    ) {
      // Remove any d-none from cur_class_list
      ind = cur_class_list.indexOf("d-none");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-none");
      }
    } else {
      // Remove any d-none from cur_class_list, and add d-none
      ind = cur_class_list.indexOf("d-none");
      while (ind != -1) {
        cur_class_list.splice(ind, 1);
        ind = cur_class_list.indexOf("d-none");
      }
      cur_class_list.push("d-none");
    }
    new_class_list = ""; 
    for (var j = 0; j < cur_class_list.length; j++) {
      new_class_list += cur_class_list[j] + " ";
    }
    new_class_list = new_class_list.substring(0, new_class_list.length - 1);
    document.getElementById(cur_proj_item.id).className = new_class_list;
  }
}

update_proj_items();

function toggleButtonStyles(btns, fill) {
  var cur_btn;
  var cur_class_list;
  var new_class_list;
  var ind;
  if (fill) {
    for (var i = 0; i < btns.length; i++) {
      cur_btn = btns[i]; 
      cur_class_list = cur_btn.className.split(' ');
      ind = cur_class_list.indexOf("btn-outline-info");
      if (ind != -1) {
        cur_class_list.splice(ind, 1);
      }
      cur_class_list.push("btn-info");
      new_class_list = ""; 
      for (var j = 0; j < cur_class_list.length; j++) {
        new_class_list += cur_class_list[j] + " ";
      }
      cur_btn.className = new_class_list;
    }
  } else {
    // Change the button styles for each of the buttons
    for (var i = 0; i < btns.length; i++) {
      cur_btn = btns[i]; 
      cur_class_list = cur_btn.className.split(' ');
      // Remove btn-info, and add btn-outline-info
      ind = cur_class_list.indexOf("btn-info");
      if (ind != -1) {
        cur_class_list.splice(ind, 1);
      }
      cur_class_list.push("btn-outline-info");
      new_class_list = ""; 
      for (var j = 0; j < cur_class_list.length; j++) {
        new_class_list += cur_class_list[j] + " ";
      }
      cur_btn.className = new_class_list;
    }
  }
}

function turningOffAllFilters(filters, button_tag) {
  // Check to see if user is trying to turn off all filters
  var filters_copy = {
    highlights: false, 
    govt: false, 
    tech: false, 
    pm: false, 
    front: false, 
    back: false, 
    abm: false, 
    community: false, 
    teaching: false, 
    research: false
  };
  filters_copy = Object.assign(filters_copy, filters);
  if (button_tag == "btn-highlights") {
    filters_copy.highlights = !filters_copy.highlights;
  } else if (button_tag == "btn-govt") {
    filters_copy.govt = !filters_copy.govt;
  } else if (button_tag == "btn-tech") {
    filters_copy.tech = !filters_copy.tech;
  } else if (button_tag == "btn-pm") {
    filters_copy.pm = !filters_copy.pm;
  } else if (button_tag == "btn-front") {
    filters_copy.front = !filters_copy.front;
  } else if (button_tag == "btn-back") {
    filters_copy.back = !filters_copy.back;
  } else if (button_tag == "btn-abm") {
    filters_copy.abm = !filters_copy.abm;
  } else if (button_tag == "btn-community") {
    filters_copy.community = !filters_copy.community;
  } else if (button_tag == "btn-teaching") {
    filters_copy.teaching = !filters_copy.teaching;
  } else if (button_tag == "btn-research") {
    filters_copy.research = !filters_copy.research;
  }
  if (
    filters_copy.highlights ||
    filters_copy.govt || 
    filters_copy.tech || 
    filters_copy.pm || 
    filters_copy.front || 
    filters_copy.back || 
    filters_copy.abm || 
    filters_copy.community || 
    filters_copy.teaching || 
    filters_copy.research
  ) {
    return false;
  } else {
    return true;
  }
}

function toggleFilter(button_tag) {
  // First check to make sure the user isn't trying to turn off all filters
  if (turningOffAllFilters(filters, button_tag)) {
    addFilterAlerts();
    return;
  }

  var btns = document.getElementsByClassName(button_tag); 
  if (button_tag == "btn-highlights") {
    if (filters.highlights) {
      filters.highlights = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.highlights = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-govt") {
    if (filters.govt) {
      filters.govt = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.govt = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-tech") {
    if (filters.tech) {
      filters.tech = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.tech = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-pm") {
    if (filters.pm) {
      filters.pm = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.pm = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-front") {
    if (filters.front) {
      filters.front = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.front = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-back") {
    if (filters.back) {
      filters.back = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.back = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-abm") {
    if (filters.abm) {
      filters.abm = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.abm = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-community") {
    if (filters.community) {
      filters.community = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.community = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-teaching") {
    if (filters.teaching) {
      filters.teaching = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.teaching = true; 
      toggleButtonStyles(btns, true);
    }
  } else if (button_tag == "btn-research") {
    if (filters.research) {
      filters.research = false; 
      toggleButtonStyles(btns, false);
    } else {
      filters.research = true; 
      toggleButtonStyles(btns, true);
    }
  } else {
    console.log("Toggle filter error, button tag " + button_tag);
  }
  update_exp_items();
  update_proj_items();
  clearFilterAlerts();
}

function addFilterAlerts() {
  // Only add an alert if there isn't already one
  var spots = document.getElementsByClassName("filter-alert-spot");
  var spot;
  for (var i = 0; i < spots.length; i++) {
    // Add a filter alert into the spot as a child if there isn't already one
    spot = spots[i];
    if (spot.innerHTML.length <= 0) {
      spot.innerHTML += '<div class="alert alert-warning alert-dismissible fade show mb-2" role="alert"><strong>Watch out!</strong> You need at least one tag active!<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
    }
  }
}

function clearFilterAlerts() {
  var spots = document.getElementsByClassName("filter-alert-spot");
  var spot;
  for (var i = 0; i < spots.length; i++) {
    spot = spots[i];
    spot.innerHTML = "";
  }
}
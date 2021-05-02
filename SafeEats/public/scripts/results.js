$(document).ready(function () {
    var lastSearched = localStorage.getItem("lastKey"); //get item last searched from local storage
    var foodObject = JSON.parse(localStorage.getItem(lastSearched)); //get food details of item last searched
    var searchList = JSON.parse(localStorage.getItem("userSearch")); //get search array from local storage
    
    renderSearchCriteria(foodObject); //display what the user searched for
    renderResult(foodObject); //display primary result (to eat or not eat)
 

    $('.search-btn').on('click', searchScreen);
});


//Function to update search criteria display
function renderSearchCriteria(itemObject) {
    $("#allergyInput").attr("value", itemObject.allergy);
    $("#itemInput").attr("value", itemObject.name);
}
//Function to update main result (to eat or not eat)
function renderResult(itemObject) {
    var foodImgUrl = itemObject.image;    
    
    $("#food-img").attr("src", foodImgUrl);
    $("#food-img").attr("alt", "image of food");
    var result = itemObject.searchResult;
    if (result == "true") {
        $("#resultPhrase").text("It looks safe!");        
        $("#results-img").attr("src", "/public/images/imgGreenLight.png");
    } else {
        $("#resultPhrase").text("No! Don't eat that! " + itemObject.name + " has " + itemObject.allergy);
        $("#results-img").attr("src","/public/images/imgredLight.png");
        
    }
   
}


//Function to redirect
function searchScreen() {
    window.location.href = "/users/search.ejs"; //redirect to Landing Page
}
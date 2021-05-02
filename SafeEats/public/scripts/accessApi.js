//global variables
var foodName;
var userAllergy;
var allergyInput;
var upcInput;
var foodImage;
var safeToEat;
var appID = "5952ffac";
var key = "791ac5c74c2c3176b2b830d9f435c7bd";
var userSearch = JSON.parse(localStorage.getItem("userSearch")); //get search array from local storage
if (!userSearch) { //if search array is undefined
    userSearch = new Array(); //create a new empty array
}

//wait until page is loaded
$(document).ready(function () { 
    //wait for user to click allergy dropdown
    $('.allergydropdown').on('click', function (event) { 
        event.preventDefault(); //prevent page from refreshing
        $('.allergydropdown').toggleClass('is-active'); //toggle class to 'is-active' to display or hide the allergy menu
    });




    
    $('select.allergydropdown').on('change', function (event) { //on click of an allergy from the dropdown
      // alert(this.event);
      
        userAllergy =event.target.value;  
        alert('You choose '+userAllergy);
        //calls function to format allergy for API
        convertAllergy(userAllergy); 
     
    });


    $('.submit-btn').on('click', function () { //when search is clicked, validate that they selected inputs, else alert them
        if (!allergyInput) {
            alert("Don't forget to choose your allergy!");//alert("Don't forget to choose your allergy!")
        } else {
            getfoodID();
        }
    });


});

//Function to change allergy to correct format
function convertAllergy(allergy) {
    if (allergy == "Dairy") {
        allergyInput = "DAIRY_FREE";
    } else if (allergy == "Eggs") {
        allergyInput = "EGG_FREE";
    } else if (allergy == "Peanuts") {
        allergyInput = "PEANUT_FREE";
    } else if (allergy == "Soy") {
        allergyInput = "SOY_FREE";
    } else if (allergy == "Wheat") {
        allergyInput = "WHEAT_FREE";
    } else if (allergy == "Tree Nuts") {
        allergyInput = "TREE_NUT_FREE";    
    }
}
//Function to reach API 
function getfoodID() {
    upcInput = $("#UPCinput").val().trim(); //save UPC in variable
    var edamamURL = "https://api.edamam.com/api/food-database/v2/parser?upc=" + upcInput + "&app_id=" + appID + "&app_key=" + key;

    //ajax function with url of the food UPC that we want to reach using GET
    $.get({
        url: edamamURL
    })
        .done(function (response) {
            foodName = response.hints[0].food.label; //get food label of user's UPC input, this is the item name
            userSearch.push(foodName); //update array of food searched
            localStorage.setItem("userSearch", JSON.stringify(userSearch)); //update the array in local storage    
            var foodID = response.hints[0].food.foodId; //get food ID of user's UPC input
            foodImg = response.hints[0].food.image; //get food image of user's UPC input
            getHealthLabel(foodID); //run function to get health labels
        }).fail(function () {//if bad request or request fails
            alert("Item not found. Please try again");//alert user to try again
        });
}

// Function to create the JSON object for the Edamam API push request, and execution
function getHealthLabel(foodID) {
    var foodJSON = {}; //create object for Edamam API 
    var ingredientsArray = new Array(); //create array
    var foodObject = { foodId: foodID }; //create food Object
    ingredientsArray.push(foodObject); //add to array
    foodJSON.ingredients = ingredientsArray; //foodJSON with property 'ingredients' has value of ingredientsArray
    var url = "https://api.edamam.com/api/food-database/v2/nutrients?app_id=" + appID + "&app_key=" + key;

    $.ajax({
        method: "POST", //post request per Edamam API to get health labels
        url: url,
        headers: {
            "Content-Type": "application/json" //reuqired by Edamam API
        },
        data: JSON.stringify(foodJSON),
    })
        .then(function (response) {
            var healthLabelsArray = response.healthLabels; //Get health labels (e.g. DAIRY-FREE)
            var safe = healthLabelsArray.indexOf(allergyInput); //find index of user's allergy
            if (safe < 0) { //if the health labels does not include the user's allergy (if index is -1)
                safeToEat = "false";
            } else {
                safeToEat = "true";
            }
            storeData(); //call function to store data in local storage
        });
}

//Function to store in Local Storage
function storeData() {
    var foodObject = { //store data as an object that Results Page can use
        name: foodName,
        allergy: userAllergy,
        item: upcInput,
        searchResult: safeToEat,
        image: foodImg,
    };
    localStorage.setItem(foodName, JSON.stringify(foodObject));
    localStorage.setItem("lastKey", foodName);
    resultsScreen(); //call function to redirect to the Results Screen after data is stored
}



function myReset() {
    document.getElementById("UPCinput").value = document.getElementById("UPCinput").defaultValue;
  
}




//Function to redirect
function resultsScreen() {
    window.location.href = "results"; //redirect to Results Page
}

// Modals JS control
var rootE1 = $(document.documentElement);
// call displayModal("") instead of alert("")
function displayModal(inputString) {
    rootE1.addClass("is-clipped"); //webpage document gets clipped
    $(".modal").addClass("is-active");
    $(".modal").addClass("is-clipped");
    console.log(inputString);
    $(".modal-text").text(inputString);
}

function closeModal() {
    rootE1.removeClass("is-clipped");
    $(".modal").removeClass("is-active");
}

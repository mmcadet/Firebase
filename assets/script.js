// Initialize Firebase

var config = {
    apiKey: "AIzaSyAKZIftl9bkhuPuzO4tcfSgzb7E62qlWYE",
    authDomain: "trains-4fa50.firebaseapp.com",
    databaseURL: "https://trains-4fa50.firebaseio.com",
    projectId: "trains-4fa50",
    storageBucket: "trains-4fa50.appspot.com",
    messagingSenderId: "416555667159"
  };

firebase.initializeApp(config);

var database = firebase.database();

var data;

  database.ref().on("value", function(snapshot) {
  // Collect from Firebase 
  data = snapshot.val();
  refreshTable();

});

$('#addTrainBtn').on("click", function() {
  // take user input
  var trainName = $("#trainNameInput").val().trim();
  var destination = $("#destinationInput").val().trim();
  var firstTrain =$("#timeInput").val().trim();
  var frequency = $("#frequencyInput").val().trim();

  var today = new Date();
  var thisMonth = today.getMonth() + 1;
  var thisDate = today.getDate();
  var thisYear = today.getFullYear();

  var dateString = "";
  var dateString = dateString.concat(thisMonth, "/", thisDate, "/", thisYear);

  var trainFirstArrival = dateString.concat(" ", trainFirstArrivalTime);

  // Push to Firebase 
  database.ref().push({
    name: trainName,
    destination: destination,
    firstArrival: trainFirstArrival,
    frequency: frequency
  });
  
  
  // clears all the text-boxes
  $("#trainNameInput").val("");
  $("#destinationInput").val("");
  $("#timeInput").val("");
  $("#frequencyInput").val("");
 
  return false;
  
});

function refreshTable(){
  $('.table-body-row').empty(); // clear previous data
  
  $.each(data, function(key, value){    // FIREBASE to HTML 
  
  var trainName = value.name;
  var trainDestination = value.destination;
  var trainFreq = value.frequency;
  var trainArrival = value.firstArrival;

  var trainNextDeparture;
  var trainMinAway;

  var convertedDate = moment(new Date(trainArrival));

  var minuteDiff = moment(convertedDate).diff( moment(), "minutes")*(-1);

      // Check for new train times and current train 
      if(minuteDiff <= 0){
        trainMinAway = moment(convertedDate).diff( moment(), "minutes");
        trainNextDepartureTime = convertedDate;
      }

      else{
        // Next Train Departure 
        trainMinAway = trainFreq - (minuteDiff % trainFreq);
        // Next Departure Time 
        var trainNextDepartureTime = moment().add(trainMinAway, 'minutes');
      }

    trainNextDeparture = trainNextDepartureTime.format("hh:mm A"); // AM/PM

// Append to HTML 

    var newRow = $('<tr>');
    newRow.addClass("table-body-row");

    var trainNameTd = $('<td>');
    var destinationTd = $('<td>');
    var frequencyTd = $('<td>');
    var nextDepartureTd = $('<td>');
    var minutesAwayTd = $('<td>');

    trainNameTd.text(trainName);
    destinationTd.text(trainDestination);
    frequencyTd.text(trainFreq);
    nextDepartureTd.text(trainNextDeparture);
    minutesAwayTd.text(trainMinAway);

    newRow.append(trainNameTd);
    newRow.append(destinationTd);
    newRow.append(frequencyTd);
    newRow.append(nextDepartureTd);
    newRow.append(minutesAwayTd);

    $('.table').append(newRow);

  });
}

var counter = setInterval(refreshTable, 60*1000);
// Update the Current Time every second
var timeStep = setInterval(currentTime, 1000);

function currentTime(){
  var timeNow = moment().format("hh:mm:ss A");
  $("#current-time").text(timeNow);

  // Refresh the Page every minute, on the minute
  var secondsNow = moment().format("ss");

  if(secondsNow == "00"){
    refreshTable();
  }

}


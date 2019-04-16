function Controller() {
    this.model = new Model(Model.glennDbConfig);
    this.addSubmitHandler();
}

Controller.prototype.addSubmitHandler = function() {
    let that = this;
    $("#employeeForm").submit(function(e) {
        e.preventDefault();
        that.processForm();
    });
}

Controller.prototype.processForm = function() {
    console.log("click");
    this.getData();
    this.model.dbPushRecord();
}

Controller.prototype.getData = function() {
    let name = $("#employeeName").val();
    let startDate = $("#startDate").val();
    let rate = $("#monthlyRate").val();
    let role = $("#employeeRole").val();

    // Update model with form data.
    this.model.setData(name, startDate, rate, role);
    console.log("model data = ", this.model.getData());
}

function Model(dbConfig) {
    this.dbConfig = dbConfig;
    this.dbInit();
    this.dbRef = this.getDbRef();
    this.addDbListener('child_added');
}
Model.prototype.name = "";
Model.prototype.startDate = "";
Model.prototype.rate = "";
Model.prototype.role = "";
Model.prototype.calcData = {"monthsWorked": 0, "totalPay": 0};
Model.prototype.dbConfig = {};
Model.prototype.glennDbConfig = {
    apiKey: "AIzaSyAPIUI8WY6dJaqFj9yVCVeGOE4f_XLCw6E",
    authDomain: "employee-billing.firebaseapp.com",
    databaseURL: "https://employee-billing.firebaseio.com",
    projectId: "employee-billing",
    storageBucket: "employee-billing.appspot.com",
    messagingSenderId: "528459595368"
};

Model.prototype.setData = function(name, startDate, rate, role) {
    this.name = name;
    this.startDate = startDate;
    this.rate = rate;
    this.role = role;
}

Model.prototype.getData = function() {
    results = {};
    results.name = this.name;
    results.startDate = this.startDate;
    results.rate = this.rate;
    results.role = this.role;
    return results;
}

Model.prototype.dbInit = function() {
    firebase.initializeApp(this.dbConfig);
}

Model.prototype.getDbRef = function(childNode) {
    return firebase.database().ref(childNode);
}

Model.prototype.dbPushRecord = function() {
    this.dbRef.push({
        "name": this.name,
        "startDate": this.startDate,
        "rate": this.rate,
        "role": this.role
      });
}

Model.prototype.addDbListener = function(dbEvent = 'child_added') {
    let that = this;
    this.dbRef.limitToLast(1).on(dbEvent, function(childSnapshot) {
        let empData = childSnapshot.val();
        that.calcData = that.paySinceStartDate(empData.startDate, empData.rate);
        that.updateView(empData);
    });
}

Model.prototype.updateView = function(dbData) {
    $("#employeeRecords").append(
        `${dbData.name} ${dbData.startDate} ${dbData.rate} ${dbData.role} ${this.calcData.monthsWorked} ${this.calcData.totalPay}<br />`
    );
}

Model.prototype.monthsWorked = function(mdyStartDate) {
    let startDateMsec = moment(mdy, "M/D/YYYY").valueOf();
    let currentDate = moment();
    let monthsWorked = currentDate.diff(startDateMsec, 'month');
    return monthsWorked;
}

Model.prototype.paySinceStartDate = function(startDate, monthlyRate) {
    results = {}
    results.monthsWorked = this.monthsWorked(startDate);
    results.totalPay = parseFloat(results.monthsWorked) * parseFloat(monthlyRate);
    return results;
}
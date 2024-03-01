$(document).ready(function () {
  let body = $("body"),
    studentForm = $("#studentForm"),
    dateOfBirth = $("#dob"),
    email = $("#email"),
    startYear = "",
    startMonth = "",
    passoutYear = "",
    passoutMonth = "",
    addFieldBtn = $("#add_field"),
    removeFieldBtn = $("#remove_btn"),
    submitBtn = $(".submit_btn"),
    popup = $(".form_container"),
    inputs = $("#studentForm input"),
    message = $(".message_container"),
    currentDate = new Date(),
    sId = 0,
    tempIndex = "",
    array = [],
    student = array[tempIndex],
    fieldCount = 2,
    isValid = true,
    isEdit = false,
    isDeleted = false;

  let mainTable = $("#dataTable").DataTable({
    columns: [
      {
        className: "details-control",
        orderable: false,
        data: null,
        defaultContent: "",
      },
      { data: "studentId" },
      { data: "fname" },
      { data: "lname" },
      { data: "dob" },
      { data: "email" },
      { data: "address" },
      { data: "gradyear" },
      { data: "action" },
    ],
  });

  // Pop-up-form function
  $(document).on("click", ".add_student", function () {
    openPopup();
  });

  $(".close_form").on("click", function () {
    closePopup();
  });

  $("#add_field").on("click", function () {
    addField();
  });

  //Open Popup --------------------------------------------
  function openPopup() {
    let rows = $(".educationTable tbody tr");

    body.css("background-color", "#00000080");
    isEdit = false;
    fieldCount = 2;
    submitBtn.css("display", "block");
    addFieldBtn.css("display", "block");
    removeFieldBtn.css("visibility", "visible");
    submitBtn.text("Submit");
    popup.addClass("open-popup");

    inputs.each(function () {
      $(this).removeClass("border_red");
      $(this).addClass("border_grey");
      $(this).next().text("");
      $(this).prop("disabled", false);
      $(this).val("");
    });

    if (rows.length > 2) {
      for (let i = 0; i < rows.length - 2; i++) {
        let removableRow = rows.eq(2 + i);
        removableRow.remove();
      }
    }
  }

  //Close Popup --------------------------------------------
  function closePopup() {
    body.css("background-color", "#fff");
    popup.removeClass("open-popup");
    removeFieldBtn.css("visibility", "hidden");
  }

  // Add Education Field ------------------------------------
  function addField() {
    let lastRow = $(".educationTable tbody tr:last-of-type");
    fieldCount += 1;
    let newRow = lastRow.clone();

    // For unique Id in new education field
    newRow
      .find("input")
      .val("")
      .each(function () {
        let id = $(this).attr("id");
        let name = $(this).attr("name");
        if (id) {
          let idNumber = parseInt(id.match(/\d+/)) + 1;
          let newId = id.replace(/\d+/, idNumber);
          let newName = name.replace(/\d/, idNumber);
          $(this).attr("id", newId);
          $(this).attr("name", newName);
        }
      });

    lastRow.parent().append(newRow);
  }

  // Remove Education field ----------------------------------
  $(".educationTable").on("click", "#remove", function (e) {
    e.preventDefault(); // Prevent default anchor behavior
    student = array[tempIndex];
    if (isEdit) {
      let row = $(this).closest("tr");
      if (!row.next().length == 0) {
        alert("Please Delete last row first");
        return;
      } else {
        let rowInputs = row.find("input");
        rowInputs.each(function () {
          let key = $(this).attr("id");

          delete student[key];
        });
      }
    }
    let removableRow = $(this).closest("tr");
    let removableId = removableRow
      .children()
      .eq(0)
      .children()
      .eq(0)
      .children()
      .eq(0)
      .attr("id");

    let idNumber = parseInt(removableId.match(/\d/));
    if (idNumber > 2) {
      removableRow.remove();
      fieldCount -= 1;
    } else {
      alert("this field is required");
    }
  });

  //Main Table Data---------------------------------
  function showData() {
    mainTable.clear().draw();
    let actionButtons =
      '<iconify-icon class="show" icon="mdi:eye"></iconify-icon>' +
      '<iconify-icon class="edit"  icon="mingcute:edit-line"></iconify-icon>' +
      '<iconify-icon class="delete"  icon="mdi:trash"></iconify-icon>';
    $.each(array, function (index, student) {
      if (student.isDeleted) {
      } else {
        let Eduaction = [];
        for (let i = 1; i <= student.studentFieldCount; i++) {
          let eduObj = {
            degree: student["degree" + i],
            school: student["school" + i],
            startDate: student["start_date" + i],
            passoutDate: student["passout_date" + i],
            percentage: student["percentage" + i],
            backlog: student["backlog" + i],
          };
          Eduaction.push(eduObj);
        }
        let obj = {
          studentId: student.studentId,
          fname: student.fname,
          lname: student.lname,
          dob: student.dob,
          email: student.email,
          address: student.address,
          gradyear: student.gradyear,
          action: actionButtons,
          details: Eduaction,
        };
        mainTable.row.add(obj).draw();
      }
    });
  }

  // opening and closing details Of Child Table-----------------------------------------------
  $("#dataTable tbody").on("click", "td.details-control", function () {
    let tr = $(this).closest("tr");
    let row = mainTable.row(tr);
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass("shown");
    } else {
      let rowData = row.data();
      let childTable = $(
        '<table class="nested-table" cellpadding="5" cellspacing="0" border="0"></table>'
      );
      var headerRow = $(
        "<thead><tr><th>Degree/School</th><th>School/College</th><th>Start Date</th><th>Passout Date</th><th>Percentage</th><th>Backlog</th></tr></thead>"
      );
      childTable.append(headerRow);
      row.child(childTable).show();
      childTable.DataTable({
        columns: [
          { data: "degree" },
          { data: "school" },
          { data: "startDate" },
          { data: "passoutDate" },
          { data: "percentage" },
          { data: "backlog" },
        ],
        data: rowData.details,
        paging: false,
        searching: false,
      });
      tr.addClass("shown");
    }
  });

  // Edit Student Details -------------------------------
  $("#dataTable").on("click", ".edit", function (e) {
    e.preventDefault();
    openPopup();
    isEdit = true;
    let studentId = $(this).closest("tr").children().eq(1).text();
    let studentIndex = array.findIndex((s) => s.studentId == studentId);
    tempIndex = studentIndex;
    let student = array[studentIndex];
    fieldCount = student.studentFieldCount;
    if (student.studentFieldCount > 2) {
      for (let i = 0; i < student.studentFieldCount - 2; i++) {
        addField();
        fieldCount = student.studentFieldCount;
      }
    }
    let inputs = $("#studentForm input");
    inputs.each(function () {
      let name = $(this).attr("id");
      $(this).val(student[name]);
    });
    submitBtn.text("Update");
  });

  // Show Student Details -------------------------------
  $("#dataTable").on("click", ".show", function (e) {
    e.preventDefault();
    openPopup();
    let studentId = $(this).closest("tr").children().eq(1).text();
    let studentIndex = array.findIndex((s) => s.studentId == studentId);
    student = array[studentIndex];
    let removeFieldBtn = $("#remove_btn");
    removeFieldBtn.css("visibility", "hidden");
    addFieldBtn.css("display", "none");
    submitBtn.css("display", "none");

    fieldCount = student.studentFieldCount;
    if (student.studentFieldCount > 2) {
      for (let i = 0; i < student.studentFieldCount - 2; i++) {
        addField();
        fieldCount = student.studentFieldCount;
      }
    }
    let inputs = $("#studentForm input");

    inputs.each(function () {
      $(this).prop("disabled", true);
      let key = $(this).attr("id");
      $(this).val(student[key]);
    });
  });

  // Delete student data -----------------------------------
  $("#dataTable").on("click", ".delete", function (e) {
    e.preventDefault();
    let studentId = $(this).closest("tr").children().eq(1).text();
    let studentIndex = array.findIndex((s) => s.studentId == studentId);
    student = array[studentIndex];
    student.isDeleted = true;
    messages("Student Deleted Successfully");
    showData();
  });

  // Validation Function ---------------------------------
  function validation() {
    let spans = $("#studentForm span");

    let inputs = $("#studentForm input");
    // Null value validation

    inputs.each(function (index) {
      if (index === 1) {
        return true;
      }

      if ($(this).val() === "") {
        $(this).removeClass("border_grey");
        $(this).addClass("border_red");
        spans.eq(index).text($(this).attr("name") + " is required");
        isValid = false;
      }
    });

    // Email validation
    let emailReg =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let letterReg = /^[a-z]+$/i;

    if (!letterReg.test($("#fname").val()) && $("#fname").val() != "") {
      $("#fname").next().text("Invalid input");
      $("#fname").removeClass("border_grey");
      $("#fname").addClass("border_red");
      isValid = false;
    } else if ($("#fname").val().length < 3 && $("#fname").val() != "") {
      $("#fname").next().text("minimum 3 character required");
      $("#fname").removeClass("border_grey");
      $("#fname").addClass("border_red");
      isValid = false;
    }

    if (!emailReg.test(email.val())) {
      email.next().text("Email is not valid");
      email.removeClass("border_grey");
      email.addClass("border_red");
      isValid = false;
    }

    // Date of birth validation
    let dob = new Date(dateOfBirth.val());
    let age = currentDate.getFullYear() - dob.getFullYear();
    let monthDiff = currentDate.getMonth() - dob.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      isValid = false;
      dateOfBirth.removeClass("border_grey");
      dateOfBirth.addClass("border_red");
      dateOfBirth.next().text("Minimum age is 18 required");
    }
    // Degree School VAlidation

    let degreeSchoolReg = /^[a-zA-Z\s-]*$/;
    let degreeSchoolInput = $(".degreeSchool");
    // console.log(degreeSchoolInput);
    degreeSchoolInput.each(function () {
      if (!degreeSchoolReg.test($(this).val()) && $(this).val() != "") {
        $(this).next().text("Invalid Input");
        $(this).removeClass("border_grey");
        $(this).addClass("border_red");
        isValid = false;
      } else if ($(this).val().length < 6 && $(this).val() != "") {
        $(this).next().text("Invalid Input");
        $(this).removeClass("border_grey");
        $(this).addClass("border_red");
        isValid = false;
      }
    });

    // Start date passout date validation
    let ind = 8;

    for (let i = 0; i < fieldCount; i++) {
      startYear = inputs.eq(ind).val().slice(0, 4);
      startMonth = inputs.eq(ind).val().substring(5, 7);
      passoutYear = inputs
        .eq(ind + 1)
        .val()
        .slice(0, 4);
      passoutMonth = inputs
        .eq(ind + 1)
        .val()
        .substring(5, 7);

      if (
        startYear > passoutYear ||
        (startYear === passoutYear && startMonth > passoutMonth)
      ) {
        isValid = false;
        inputs.eq(ind + 1).addClass("border_red");
        inputs
          .eq(ind + 1)
          .next()
          .text("Passout date is not valid");
      }
      ind += 6;
    }
    return isValid;
  }

  // message function -----------------------------------
  function messages(s) {
    message.html(`<iconify-icon icon="ep:success-filled"></iconify-icon> ${s}`);
    message.css("display", "block");
    setTimeout(() => {
      message.css("display", "none");
    }, 3000);
  }

  // Border grey ---
  addFieldBtn.on("click", function () {
    inputs = $("#studentForm").find("input");
    inputs.on("click", function () {
      $(this).removeClass("border_red");
      $(this).addClass("border_grey");
      $(this).next().text("");
    });
  });
  inputs.on("click", function () {
    $(this).removeClass("border_red");
    $(this).addClass("border_grey");
    $(this).next().text("");
  });

  // Future date-show prevention -------
  // For date of birth
  dateOfBirth.attr("max", currentDate);

  // For Start Date
  let yearMonth =
    currentDate.getFullYear() +
    "-" +
    ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let startDate = $(".start_date");
  startDate.attr("max", yearMonth);

  // SUBMIT MAIN FUNCTION
  studentForm.on("submit", function (e) {
    e.preventDefault();

    isValid = true;
    validation();
    if (isValid) {
      if (!isEdit) {
        sId += 1;
        const information = {
          studentId: sId,
          studentFieldCount: fieldCount,
          isDeleted: isDeleted,
        };
        let studentInputs = $("#studentForm input");
        studentInputs.each(function () {
          let key = $(this).attr("id");
          let value = $(this).val();
          information[key] = value;
        });

        messages("Student added Successfully");
        array.push(information);
      } else {
        student = array[tempIndex];
        student.studentFieldCount = fieldCount;
        let inputs = $("#studentForm input");
        inputs.each(function () {
          let name = $(this).attr("id");
          student[name] = $(this).val();
        });
        messages("Studen Details Updated");
      }
      closePopup();
      studentForm[0].reset();
      showData();
    } else {
      console.log("something went wrong");
    }
    console.log(array);
  });
});

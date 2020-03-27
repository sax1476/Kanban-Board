/* jshint esversion: 6 */
const newTitle = document.getElementById("card-title");
const newContent = document.getElementById("card-content");
const dragPopup = document.getElementById("drag-popup");
const dragBtn = document.querySelectorAll(".drag-btn");
const dragDelete = document.querySelector(".fa-trash");
const dragChange = document.querySelector(".fa-wrench");
const changePopup = document.getElementById("change-popup");
const changeTitle = document.getElementById("change-title");
const changeContent = document.getElementById("change-content");
const changeCancelBtn = document.getElementById("change-cancel");
const changeSubmitBtn = document.getElementById("change-submit");
const maxPopup = document.getElementById("max-popup");
const maxNumber = document.getElementById("max-number");
const maxCancelBtn = document.getElementById("max-cancel");
const maxSubmitBtn = document.getElementById("max-submit");
// variables
let eventTarget;
/************************************************* */
let data = {
  getData: function() {
    return JSON.parse(localStorage.getItem("kanban"));
  },
  setData: function(data) {
    return localStorage.setItem("kanban", JSON.stringify(data));
  },
  add: function(e) {
    e.preventDefault();
    // get data
    let tempData = data.getData();
    if (tempData == undefined) {
      tempData = [
        {
          id: "cont-1",
          max: 6,
          items: []
        },
        {
          id: "cont-2",
          max: 6,
          items: []
        },
        {
          id: "cont-3",
          max: 6,
          items: []
        },
        {
          id: "cont-4",
          max: 6,
          items: []
        }
      ];
    }
    // max check
    if (tempData[0].max <= tempData[0].items.length) {
      alert("Can't add anymore!");
      return false;
    }
    // get current time for id
    let time = new Date();
    // store new card
    tempData[0].items.push([time.getTime(), newTitle.value, newContent.value]);
    // reset input field
    newTitle.value = "";
    newContent.value = "";
    // set data to localStorage
    data.setData(tempData);
    // re-fetch display
    view.cards();
  },
  delete: function(containerId, id) {
    let tempData = data.getData();
    tempData.map(container => {
      if (container.id === containerId) {
        container.items.map((item, i) => {
          if (item[0] == Number(id)) {
            container.items.splice(i, 1);
            // return item for moving
            return true;
          }
        });
      }
    });
    data.setData(tempData);
  },
  change: function(newTitle, newContent) {
    let tempData = data.getData();
    let id = eventTarget.id;
    let containerId = eventTarget.parentNode.parentNode.id;
    // loop -> change
    tempData.map(container => {
      if (container.id === containerId) {
        container.items.map((item, i) => {
          if (item[0] == Number(id)) {
            item[1] = newTitle;
            item[2] = newContent;
            return true;
          }
        });
      }
    });
    data.setData(tempData);
  },
  move: function(newContainerId, nearestId = undefined) {
    let tempData = data.getData();
    let id = eventTarget.id;
    let oldContainerId = eventTarget.parentNode.parentNode.id;
    let checkMax;
    // delete + get old item
    let movingItem;
    tempData.map(container => {
      if (container.id === oldContainerId) {
        container.items.map((item, i) => {
          if (item[0] == Number(id)) {
            movingItem = item;
            container.items.splice(i, 1);
          }
        });
      }
    });
    // insert to new position
    tempData.map(container => {
      if (container.id === newContainerId) {
        // check max
        if (container.max > container.items.length) {
          // max: true
          // check insert positon
          if (nearestId == undefined) {
            // case 1: last item -> push
            container.items.push(movingItem);
          } else {
            // case 2: not last item -> find nearest item -> add
            container.items.map((item, i) => {
              if (item[0] == Number(nearestId)) {
                let itemBehind = container.items.slice(i);
                container.items.splice(
                  i,
                  container.items.length - i,
                  movingItem
                );
                container.items.push(...itemBehind);
              }
            });
          }
          // set new data
          data.setData(tempData);
          return (checkMax = true);
        } else {
          // max: false
          alert("This column is full!");
          return (checkMax = false);
        }
      }
    });
    return checkMax;
  }
};
/*****************************************************************/
// drag handler
let drag = {
  start: function(e) {
    e.target.classList.add("dragging");
    dragPopup.style.opacity = 1;
    [...dragBtn].forEach(btn => {
      btn.style.pointerEvents = "all";
    });
  },
  end: function(e) {
    e.target.classList.remove("dragging");
    dragPopup.style.opacity = 0;
    [...dragBtn].forEach(btn => {
      btn.style.pointerEvents = "none";
    });
  },
  nearest: function(y, container) {
    // get remaining items
    let remainItems = [...container.querySelectorAll(".item:not(.dragging)")];
    // initiate nearest object
    let nearest;
    // loop
    remainItems.reduce((nearestOffset, item) => {
      // get offset of each item's Y-axis to the mouse's Y position
      let { height, top } = item.getBoundingClientRect();
      let offset = y - top - height / 2;
      // check for the item under & nearest the mouse
      if (offset < 0 && offset > nearestOffset) {
        // true -> set new nearest item, nearest offset
        nearest = item;
        return offset;
      } else {
        // false -> return the old nearest offset
        return nearestOffset;
      }
    }, Number.NEGATIVE_INFINITY);
    return nearest;
  },
  delete: function() {
    // get id
    let id = eventTarget.id;
    let containerId = eventTarget.parentNode.parentNode.id;
    // delete in storage
    data.delete(containerId, id);
    // remove node
    document
      .getElementById(containerId)
      .lastElementChild.removeChild(eventTarget);
  },
  changeCancel: function() {
    changePopup.style.opacity = 0;
    changePopup.style.pointerEvents = "none";
  },
  changeSubmit: function(e) {
    e.preventDefault();
    // get change
    let newTitle = changeTitle.value;
    let newContent = changeContent.value;
    // change storage's data
    data.change(newTitle, newContent);
    // change display
    eventTarget.children[0].textContent = newTitle;
    eventTarget.children[2].textContent = newContent;
    // hide popup
    drag.changeCancel();
  }
};
/*****************************************************************/
// view functions
let view = {
  cards: function() {
    // get data
    let tempData = data.getData();
    // reset display
    [...document.querySelectorAll(".main")].forEach(items => {
      items.innerHTML = "";
    });
    // display from data
    tempData.map(container => {
      // change max display
      document.querySelector(
        "#" + container.id + " .header button"
      ).textContent = "Max: " + container.max;
      // change cards display
      container.items.map(item => {
        // create item's div
        let newDiv = document.createElement("div");
        newDiv.draggable = "true";
        newDiv.className = "item";
        newDiv.id = item[0];
        // add contents
        newDiv.innerHTML +=
          "<h6>" + item[1] + "</h6>" + "<hr />" + "<p>" + item[2] + "</p>";
        // append to container
        document
          .querySelector("#" + container.id + " .main")
          .appendChild(newDiv);
        // apply drag event listener
        let newItem = document.getElementById(item[0]);
        newItem.addEventListener("dragstart", drag.start);
        newItem.addEventListener("dragend", drag.end);
        newItem.addEventListener("drop", drag.end);
      });
    });
  },
  showChangePopup: function() {
    changePopup.style.opacity = 1;
    changePopup.style.pointerEvents = "all";
    // set current text
    changeTitle.value = eventTarget.children[0].textContent;
    changeContent.value = eventTarget.children[2].textContent;
  },
  showMaxPopup: function() {
    maxPopup.style.opacity = 1;
    maxPopup.style.pointerEvents = "all";
  }
};

/*****************************************************************/
let max = {
  maxCancel: function() {
    maxPopup.style.opacity = 0;
    maxPopup.style.pointerEvents = "none";
  },
  maxSubmit: function(e) {
    e.preventDefault();
    // get container id
    let newMax = maxNumber.value;
    let containerId = eventTarget.parentNode.parentNode.id;
    // get local storage data
    let tempData = data.getData();
    tempData.map(container => {
      if (container.id == containerId) {
        container.max = Number(newMax);
        return true;
      }
    });
    data.setData(tempData);
    // change display
    eventTarget.textContent = "Max: " + newMax;
    max.maxCancel();
  }
};
/*****************************************************************/
// EVENT LISTENER
// item event
[...document.querySelectorAll(".item")].forEach(item => {
  // cards event
  item.addEventListener("dragstart", drag.start);
  item.addEventListener("dragend", drag.end);
});
// drag & sort event
[...document.querySelectorAll(".main")].forEach(container => {
  container.addEventListener("dragover", e => {
    // prevent pointer default display
    e.preventDefault();
  });
  container.addEventListener("drop", e => {
    eventTarget = document.querySelector(".dragging");
    // get mouse Y
    let y = e.clientY;
    // get nearest item
    let nearest = drag.nearest(y, container);
    // move data
    let nearestId;
    if (nearest == undefined) {
      nearestId = undefined;
    } else {
      nearestId = nearest.id;
    }
    if (data.move(container.parentNode.id, nearestId)) {
      // insert to new container
      container.insertBefore(eventTarget, nearest);
    }
  });
});
// drag & delete/change event
[...dragBtn].forEach(btn => {
  btn.addEventListener("dragover", e => {
    e.preventDefault();
  });
});
dragDelete.addEventListener("drop", e => {
  eventTarget = document.querySelector(".dragging");
  if (confirm("Are you sure")) {
    drag.delete();
  }
});
dragChange.addEventListener("drop", e => {
  eventTarget = document.querySelector(".dragging");
  view.showChangePopup();
});
changeCancelBtn.addEventListener("click", drag.changeCancel);
changeSubmitBtn.addEventListener("click", drag.changeSubmit);
// other event listener
document.getElementById("card-submit").addEventListener("click", data.add);
[...document.querySelectorAll(".max-btn")].forEach(btn => {
  btn.addEventListener("click", e => {
    eventTarget = e.target;
    view.showMaxPopup();
  });
});
maxCancelBtn.addEventListener("click", max.maxCancel);
maxSubmitBtn.addEventListener("click", max.maxSubmit);

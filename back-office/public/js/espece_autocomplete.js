document.getElementById("espece").addEventListener("input", e => {
  let input = e.target;
  let datalist = document.querySelector(".espece-list");

  if (input.value.length < 3) {
    datalist.id = "";
  } else {
    datalist.id = "espece-list";
  }

  let options = document.querySelectorAll(`#espece-list option`);
  let hidden_input = document.getElementById("espece-hidden");

  hidden_input.value = input.value;

  for (let option of options) {
    if (option.innerText == input.value) {
      hidden_input.value = option.getAttribute("data-value");
      input.setCustomValidity("");
      return;
    }
  }

  input.setCustomValidity("Veuillez sélectionner une espèce de la liste");
});

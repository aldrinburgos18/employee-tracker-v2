function validateText(answer) {
  if (answer) {
    return true;
  } else {
    console.log(`\n Please type in a valid name!`);
    return false;
  }
}

function validateNum(answer) {
  if (isNaN(answer) || !answer) {
    console.log(`\n Please enter a number!`);
    return false;
  } else {
    return true;
  }
}

module.exports = { validateText, validateNum };

const ParsePhoneNumber = require("libphonenumber-js");

const phoneNumberFormatter = function (number) {
  // 1. Menghilangkan karakter selain angka  659922850  5  6
  //                                         123456789 10 11
  let formatted = number.replace(/\D/g, "");
  if (formatted.length === 11) {
    const ddd = formatted.slice(0, 2);
    const num = formatted.slice(3, 11);
    formatted = `${ddd}${num}`;
  }

  // console.log(formatted);

  let phoneNumber = ParsePhoneNumber.parsePhoneNumber(formatted, "BR")
    ?.format("E.164")
    ?.replace("+", "");

  phoneNumber = phoneNumber.includes("@c.us")
    ? phoneNumber
    : `${phoneNumber}@c.us`;

  // 2. Menghilangkan angka 0 di depan (prefix)
  //    Kemudian diganti dengan 62
  // if (formatted.startsWith("0")) {
  //   formatted = "62" + formatted.substr(1);
  // }

  // if (!formatted.endsWith("@c.us")) {
  //   formatted += "@c.us";
  // }

  return phoneNumber;
};

module.exports = {
  phoneNumberFormatter,
};

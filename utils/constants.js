const PHONE_REGEX = /^\+?\d{10,15}$/;
const PASSWORD_REGEX =
  /^(?=(.*[A-Z]){2,})(?=(.*[a-z]){2,})(?=(.*\d){2,})(?=(.*[!@#$%^&*(),.?":{}|<>]){2,}).{8,}$/;

module.exports = { PHONE_REGEX, PASSWORD_REGEX };
